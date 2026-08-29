import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { OrderPayment } from './entities/order-payment.entity';
import { Order } from '../orders/entities/order.entity';
import { CustomerProfile } from '../../master/customer-profile/entities/customer-profile.entity';
import { FindAllOrderPaymentDto } from './dto/find-all-order-payment.dto';
import { RejectOrderPaymentDto } from './dto/reject-order-payment.dto';
import {
  ORDER_PAYMENT_STATUS_TRANSITIONS,
  OrderPaymentInstallment,
  OrderPaymentStatus,
} from './order-payment.enum';
import { ORDER_STATUS_TRANSITIONS, OrderStatus } from '../orders/order-status.enum';
import { AttachmentService } from '../../master/attachment/attachment.service';

export interface CreateOrderPaymentParams {
  orderId: string;
  installment: OrderPaymentInstallment;
  amount: number;
  bankAccountId: string | null;
  bankName: string;
  accountNumber: string;
  accountHolderName: string;
  actorUserId: string | null;
}

const ORDER_PAYMENT_REFERENCE_TABLE = 'order_payments';
const PAYMENT_PROOF_ATTACHMENT_CATEGORY = 'payment_proof';

@Injectable()
export class OrderPaymentsService {

  private readonly logger = new Logger(OrderPaymentsService.name);

  constructor(
    @InjectRepository(OrderPayment)
    private readonly orderPaymentRepository: Repository<OrderPayment>,

    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,

    @InjectRepository(CustomerProfile)
    private readonly customerProfileRepository: Repository<CustomerProfile>,

    private readonly attachmentService: AttachmentService,
  ) {}

  //=========================== GET ALL ORDER PAYMENT (PAGINATION) ======================================
  // Catatan: endpoint ini masih dapat diakses oleh siapa pun yang login (dipakai jadi antrean
  // verifikasi pembayaran admin) — belum ada guard role admin di codebase ini. Kalau nanti ada
  // role guard, ini titik yang pas untuk dibatasi ke role admin saja.
  async findAll(query: FindAllOrderPaymentDto) {

    const { orderId, status, pageNumber = 1, pageSize = 10 } = query;

    const [data, total] = await this.orderPaymentRepository.findAndCount({
      where: {
        ...(orderId ? { order: { id: String(orderId) } } : {}),
        ...(status ? { status } : {}),
      },
      relations: {
        order: {
          customer: true,
          vendor: true,
        },
      },
      order: {
        id: 'DESC',
      },
      skip: (pageNumber - 1) * pageSize,
      take: pageSize,
    });

    const dataWithProof = await Promise.all(
      data.map((payment) => this.attachProofId(payment)),
    );

    return {
      data: dataWithProof,
      total,
      pageNumber,
      pageSize,
    };
  }
  //========================================================================================

  //=========================== GET ORDER PAYMENT BY ID (+ proof attachment id) ======================================
  async findOne(id: string) {
    const payment = await this.getPaymentOrThrow(id);
    return await this.attachProofId(payment);
  }
  //========================================================================================

  //=========================== CREATE ORDER PAYMENT (dipakai OrdersService saat checkout) ======================================
  // Rekening tujuan (bankName/accountNumber/accountHolderName) disnapshot oleh caller (OrdersService,
  // dari rekening utama vendor saat itu) — service ini cuma menyimpan apa yang diberikan, tidak
  // melakukan lookup rekening sendiri, supaya bisa dipanggil di dalam transaksi yang sama dengan
  // pembuatan order.
  async createForOrder(
    params: CreateOrderPaymentParams,
    manager?: EntityManager,
  ): Promise<OrderPayment> {
    const repo = manager
      ? manager.getRepository(OrderPayment)
      : this.orderPaymentRepository;

    const payment = repo.create({
      order: { id: params.orderId } as Order,
      installment: params.installment,
      amount: params.amount,
      bankAccount: params.bankAccountId
        ? { id: params.bankAccountId }
        : null,
      bankName: params.bankName,
      accountNumber: params.accountNumber,
      accountHolderName: params.accountHolderName,
      status: OrderPaymentStatus.WAITING_PAYMENT,
      active: true,
      createdBy: params.actorUserId,
      createdAt: new Date(),
    });

    return await repo.save(payment);
  }
  //========================================================================================

  //=========================== SUBMIT / UPLOAD ULANG BUKTI PEMBAYARAN (customer) ======================================
  // Mengikuti pola replaceAvatarAttachment di customer-profile: bukti lama untuk kategori ini
  // dihapus (kalau ada, mis. karena sebelumnya ditolak admin), lalu bukti baru diupload. Cuma
  // customer pemilik order yang boleh submit, dan cuma valid dari status WAITING_PAYMENT/REJECTED
  // (lihat ORDER_PAYMENT_STATUS_TRANSITIONS) — mis. tidak bisa upload ulang untuk pembayaran yang
  // sudah PAID.
  async submitProof(
    id: string,
    file: Express.Multer.File | undefined,
    requestUserId: number | null,
  ) {
    if (!file) {
      throw new BadRequestException('File bukti pembayaran wajib diisi');
    }

    const payment = await this.getPaymentOrThrow(id);
    await this.assertCustomerOwnership(payment, requestUserId);
    this.assertPaymentTransition(payment.status, OrderPaymentStatus.WAITING_VERIFICATION);

    const actorUserId = requestUserId !== null ? String(requestUserId) : null;

    const existing = await this.attachmentService.findAll({
      referenceTable: ORDER_PAYMENT_REFERENCE_TABLE,
      referenceId: Number(payment.id),
      category: PAYMENT_PROOF_ATTACHMENT_CATEGORY,
      pageNumber: 1,
      pageSize: 10,
    });

    for (const attachment of existing.data) {
      try {
        await this.attachmentService.remove(attachment.id);
      } catch (error: any) {
        this.logger.warn(
          `Gagal menghapus bukti pembayaran lama ${attachment.id}: ${error.message}`,
        );
      }
    }

    await this.attachmentService.create(
      file,
      {
        referenceTable: ORDER_PAYMENT_REFERENCE_TABLE,
        referenceId: Number(payment.id),
        category: PAYMENT_PROOF_ATTACHMENT_CATEGORY,
        sortOrder: 0,
      },
      actorUserId,
    );

    payment.status = OrderPaymentStatus.WAITING_VERIFICATION;
    payment.paidAt = new Date();
    payment.rejectReason = null;
    payment.modifiedBy = actorUserId;
    payment.modifiedAt = new Date();

    await this.orderPaymentRepository.save(payment);

    return await this.findOne(payment.id);
  }
  //========================================================================================

  //=========================== VERIFIKASI PEMBAYARAN (admin) ======================================
  // Efek samping: kalau order masih PENDING_PAYMENT, dimajukan ke WAITING_VENDOR_CONFIRMATION
  // begitu pembayaran yang menentukan (DP/FULL) diverifikasi lunas.
  async verify(id: string, actorUserId: string | null) {
    const payment = await this.getPaymentOrThrow(id);
    this.assertPaymentTransition(payment.status, OrderPaymentStatus.PAID);

    payment.status = OrderPaymentStatus.PAID;
    payment.verifiedAt = new Date();
    payment.verifiedBy = actorUserId;
    payment.modifiedBy = actorUserId;
    payment.modifiedAt = new Date();

    await this.orderPaymentRepository.save(payment);

    const order = await this.orderRepository.findOne({
      where: { id: payment.order.id },
    });
    const canAdvanceOrder =
      order &&
      (ORDER_STATUS_TRANSITIONS[order.status as OrderStatus] ?? []).includes(
        OrderStatus.WAITING_VENDOR_CONFIRMATION,
      );
    if (order && canAdvanceOrder) {
      order.status = OrderStatus.WAITING_VENDOR_CONFIRMATION;
      order.modifiedBy = actorUserId;
      order.modifiedAt = new Date();
      await this.orderRepository.save(order);
    }

    return await this.findOne(payment.id);
  }
  //========================================================================================

  //=========================== TOLAK PEMBAYARAN (admin) — termasuk kasus "minta upload ulang" ======================================
  async reject(id: string, dto: RejectOrderPaymentDto, actorUserId: string | null) {
    const payment = await this.getPaymentOrThrow(id);
    this.assertPaymentTransition(payment.status, OrderPaymentStatus.REJECTED);

    payment.status = OrderPaymentStatus.REJECTED;
    payment.rejectReason = dto.rejectReason;
    payment.modifiedBy = actorUserId;
    payment.modifiedAt = new Date();

    await this.orderPaymentRepository.save(payment);

    return await this.findOne(payment.id);
  }
  //========================================================================================

  //============================ HELPER: VALIDASI TRANSISI STATUS (ORDER_PAYMENT_STATUS_TRANSITIONS) ==============================
  private assertPaymentTransition(from: string, to: OrderPaymentStatus): void {
    const allowed = ORDER_PAYMENT_STATUS_TRANSITIONS[from as OrderPaymentStatus] ?? [];
    if (!allowed.includes(to)) {
      throw new BadRequestException(
        `Pembayaran tidak bisa berpindah dari status ${from} ke ${to}`,
      );
    }
  }
  //========================================================================================

  //============================ HELPER: PASTIKAN CALLER ADALAH CUSTOMER PEMILIK ORDER ==============================
  private async assertCustomerOwnership(
    payment: OrderPayment,
    requestUserId: number | null,
  ): Promise<void> {
    if (requestUserId === null) {
      throw new ForbiddenException('Anda tidak berhak mengubah pembayaran ini');
    }

    const customer = await this.customerProfileRepository.findOne({
      where: { user: { id: requestUserId } },
    });

    if (!customer || customer.id !== payment.order.customer.id) {
      throw new ForbiddenException('Anda tidak berhak mengubah pembayaran ini');
    }
  }
  //========================================================================================

  //============================ HELPER: SUSUN PAYMENT + PROOF ATTACHMENT ID ==============================
  private async attachProofId(payment: OrderPayment) {
    const proofs = await this.attachmentService.findAll({
      referenceTable: ORDER_PAYMENT_REFERENCE_TABLE,
      referenceId: Number(payment.id),
      category: PAYMENT_PROOF_ATTACHMENT_CATEGORY,
      pageNumber: 1,
      pageSize: 1,
    });

    return {
      ...payment,
      proofAttachmentId: proofs.data[0]?.id ?? null,
    };
  }
  //========================================================================================

  private async getPaymentOrThrow(id: string): Promise<OrderPayment> {
    const payment = await this.orderPaymentRepository.findOne({
      where: { id },
      relations: { order: { customer: true }, bankAccount: true },
    });

    if (!payment) {
      throw new NotFoundException('Order payment not found');
    }

    return payment;
  }

}
