import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, ILike, Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { CustomerProfile } from '../../master/customer-profile/entities/customer-profile.entity';
import { VendorProfile } from '../../master/vendor-profile/entities/vendor-profile.entity';
import { VendorProduct } from '../../master/vendor-products/entities/vendor-product.entity';
import { VendorProductStatus } from '../../master/vendor-products/vendor-product-status.enum';
import { BankAccount } from '../../master/bank-accounts/entities/bank-account.entity';
import { Status } from '../../../common/enums/status.enum';
import { CreateOrderDto } from './dto/create-order.dto';
import { FindAllOrderDto } from './dto/find-all-order.dto';
import { RejectOrderDto } from './dto/reject-order.dto';
import {
  ORDER_STATUS_TRANSITIONS,
  OrderPaymentType,
  OrderStatus,
} from './order-status.enum';
import { OrderPaymentsService } from '../order-payments/order-payments.service';
import { OrderPaymentInstallment } from '../order-payments/order-payment.enum';

interface CallerScope {
  customerProfileId: number | null;
  vendorProfileId: number | null;
}

@Injectable()
export class OrdersService {

  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,

    @InjectRepository(CustomerProfile)
    private readonly customerProfileRepository: Repository<CustomerProfile>,

    @InjectRepository(VendorProfile)
    private readonly vendorProfileRepository: Repository<VendorProfile>,

    @InjectRepository(VendorProduct)
    private readonly vendorProductRepository: Repository<VendorProduct>,

    @InjectRepository(BankAccount)
    private readonly bankAccountRepository: Repository<BankAccount>,

    @InjectDataSource()
    private readonly dataSource: DataSource,

    private readonly orderPaymentsService: OrderPaymentsService,
  ) {}

  //=========================== GET ALL ORDER (PAGINATION, discope ke order milik caller) ======================================
  // Customer cuma bisa lihat order miliknya sendiri, vendor cuma bisa lihat order untuk produknya
  // sendiri. customerId/vendorId di query cuma valid kalau sama dengan profile milik caller —
  // kalau tidak dikirim sama sekali, otomatis discope ke profile milik caller (customer atau vendor).
  async findAll(query: FindAllOrderDto, requestUserId: number | null) {

    const { filter, customerId, vendorId, status, pageNumber = 1, pageSize = 10 } = query;
    const scope = await this.resolveCallerScope(requestUserId);

    let effectiveCustomerId = customerId;
    let effectiveVendorId = vendorId;

    if (customerId !== undefined && customerId !== scope.customerProfileId) {
      throw new ForbiddenException('Anda hanya dapat melihat order milik sendiri');
    }
    if (vendorId !== undefined && vendorId !== scope.vendorProfileId) {
      throw new ForbiddenException('Anda hanya dapat melihat order untuk vendor profile sendiri');
    }

    if (customerId === undefined && vendorId === undefined) {
      if (scope.customerProfileId !== null) {
        effectiveCustomerId = scope.customerProfileId;
      } else if (scope.vendorProfileId !== null) {
        effectiveVendorId = scope.vendorProfileId;
      } else {
        return { data: [], total: 0, pageNumber, pageSize };
      }
    }

    const [data, total] = await this.orderRepository.findAndCount({
      where: {
        ...(filter ? { orderNumber: ILike(`%${filter}%`) } : {}),
        ...(effectiveCustomerId ? { customer: { id: effectiveCustomerId } } : {}),
        ...(effectiveVendorId ? { vendor: { id: effectiveVendorId } } : {}),
        ...(status ? { status } : {}),
      },
      relations: {
        customer: true,
        vendor: true,
        vendorProduct: true,
      },
      order: {
        id: 'DESC',
      },
      skip: (pageNumber - 1) * pageSize,
      take: pageSize,
    });

    return {
      data,
      total,
      pageNumber,
      pageSize,
    };
  }
  //========================================================================================

  //=========================== GET ORDER BY ID (+ daftar order_payments) ======================================
  // Cuma customer pemilik order atau vendor penerima order yang boleh mengakses.
  async findOne(id: string, requestUserId: number | null) {
    const order = await this.getOrderOrThrow(id);
    await this.assertOwnership(order, requestUserId);

    const payments = await this.orderPaymentsService.findAll({
      orderId: Number(order.id),
      pageNumber: 1,
      pageSize: 20,
    });

    return {
      ...order,
      payments: payments.data,
    };
  }
  //========================================================================================

  //=========================== CREATE ORDER (checkout) ======================================
  // Pemilik order (customer) selalu diambil dari token JWT, bukan dari body — mencegah customer
  // membuat order atas nama customer lain. Harga & vendor juga selalu ditentukan dari data
  // vendor_products di server, tidak pernah dipercaya dari request. Vendor penerima order harus
  // aktif & berstatus VERIFIED, dan produknya harus ACTIVE, sebelum order boleh dibuat.
  async create(dto: CreateOrderDto, requestUserId: number | null) {
    if (requestUserId === null) {
      throw new NotFoundException('Customer profile not found for this user');
    }

    const customer = await this.customerProfileRepository.findOne({
      where: { user: { id: requestUserId } },
    });
    if (!customer) {
      throw new NotFoundException('Customer profile not found for this user');
    }

    const vendorProduct = await this.vendorProductRepository.findOne({
      where: { id: String(dto.vendorProductId) },
      relations: { vendor: { user: true } },
    });
    if (!vendorProduct) {
      throw new NotFoundException('Vendor product not found');
    }
    if (
      !vendorProduct.active ||
      vendorProduct.status !== (VendorProductStatus.ACTIVE as string)
    ) {
      throw new BadRequestException('Produk ini sedang tidak tersedia untuk dipesan');
    }
    if (
      !vendorProduct.vendor.active ||
      vendorProduct.vendor.status !== Number(Status.VERIFIED)
    ) {
      throw new BadRequestException(
        'Vendor belum aktif/terverifikasi, tidak bisa menerima pesanan saat ini',
      );
    }

    const bankAccount = await this.bankAccountRepository.findOne({
      where: {
        user: { id: vendorProduct.vendor.user.id },
        active: true,
        isPrimary: true,
      },
    });
    if (!bankAccount) {
      throw new BadRequestException(
        'Vendor belum melengkapi rekening bank utama, tidak bisa menerima pesanan saat ini',
      );
    }

    const amount = this.resolvePaymentAmount(dto.paymentType, vendorProduct);
    const createdBy = String(requestUserId);

    const order = await this.dataSource.transaction(async (manager) => {
      const orderRepo = manager.getRepository(Order);

      const newOrder = orderRepo.create({
        orderNumber: await this.generateUniqueOrderNumber(orderRepo),
        customer,
        vendor: vendorProduct.vendor,
        vendorProduct,
        productName: vendorProduct.name,
        productPrice: vendorProduct.price,
        productMinimumDp: vendorProduct.minimumDp,
        eventDate: dto.eventDate,
        eventLocation: dto.eventLocation,
        guestCount: dto.guestCount,
        notes: dto.notes,
        paymentType: dto.paymentType,
        totalAmount: vendorProduct.price,
        status: OrderStatus.PENDING_PAYMENT,
        active: true,
        createdBy,
        createdAt: new Date(),
      });

      const savedOrder = await orderRepo.save(newOrder);

      await this.orderPaymentsService.createForOrder(
        {
          orderId: savedOrder.id,
          installment:
            dto.paymentType === OrderPaymentType.FULL
              ? OrderPaymentInstallment.FULL
              : OrderPaymentInstallment.DP,
          amount,
          bankAccountId: bankAccount.id,
          bankName: bankAccount.bankName,
          accountNumber: bankAccount.accountNumber,
          accountHolderName: bankAccount.accountHolderName,
          actorUserId: createdBy,
        },
        manager,
      );

      return savedOrder;
    });

    return await this.findOne(order.id, requestUserId);
  }
  //========================================================================================

  //=========================== KONFIRMASI ORDER (vendor menerima) ======================================
  async confirm(id: string, requestUserId: number | null) {
    const order = await this.getOrderOrThrow(id);
    await this.assertVendorOwnership(order, requestUserId);
    this.assertTransition(order.status, OrderStatus.CONFIRMED);

    order.status = OrderStatus.CONFIRMED;
    order.confirmedAt = new Date();
    order.modifiedBy = requestUserId !== null ? String(requestUserId) : null;
    order.modifiedAt = new Date();

    await this.orderRepository.save(order);

    return await this.findOne(order.id, requestUserId);
  }
  //========================================================================================

  //=========================== TOLAK ORDER (vendor menolak) ======================================
  async reject(id: string, dto: RejectOrderDto, requestUserId: number | null) {
    const order = await this.getOrderOrThrow(id);
    await this.assertVendorOwnership(order, requestUserId);
    this.assertTransition(order.status, OrderStatus.REJECTED_BY_VENDOR);

    order.status = OrderStatus.REJECTED_BY_VENDOR;
    order.rejectReason = dto.rejectReason;
    order.modifiedBy = requestUserId !== null ? String(requestUserId) : null;
    order.modifiedAt = new Date();

    await this.orderRepository.save(order);

    return await this.findOne(order.id, requestUserId);
  }
  //========================================================================================

  //============================ HELPER: VALIDASI TRANSISI STATUS (ORDER_STATUS_TRANSITIONS) ==============================
  private assertTransition(from: string, to: OrderStatus): void {
    const allowed = ORDER_STATUS_TRANSITIONS[from as OrderStatus] ?? [];
    if (!allowed.includes(to)) {
      throw new BadRequestException(
        `Order tidak bisa berpindah dari status ${from} ke ${to}`,
      );
    }
  }
  //========================================================================================

  //============================ HELPER: RESOLVE CUSTOMER/VENDOR PROFILE MILIK CALLER ==============================
  private async resolveCallerScope(requestUserId: number | null): Promise<CallerScope> {
    if (requestUserId === null) {
      return { customerProfileId: null, vendorProfileId: null };
    }

    const [customer, vendor] = await Promise.all([
      this.customerProfileRepository.findOne({ where: { user: { id: requestUserId } } }),
      this.vendorProfileRepository.findOne({ where: { user: { id: requestUserId } } }),
    ]);

    return {
      customerProfileId: customer?.id ?? null,
      vendorProfileId: vendor?.id ?? null,
    };
  }
  //========================================================================================

  //============================ HELPER: PASTIKAN CALLER PEMILIK ORDER (customer ATAU vendor) ==============================
  private async assertOwnership(order: Order, requestUserId: number | null): Promise<void> {
    const scope = await this.resolveCallerScope(requestUserId);
    const isOwner =
      (scope.customerProfileId !== null && scope.customerProfileId === order.customer.id) ||
      (scope.vendorProfileId !== null && scope.vendorProfileId === order.vendor.id);

    if (!isOwner) {
      throw new ForbiddenException('Anda tidak berhak mengakses order ini');
    }
  }
  //========================================================================================

  //============================ HELPER: PASTIKAN CALLER ADALAH VENDOR PEMILIK ORDER ==============================
  private async assertVendorOwnership(order: Order, requestUserId: number | null): Promise<void> {
    const scope = await this.resolveCallerScope(requestUserId);
    if (scope.vendorProfileId === null || scope.vendorProfileId !== order.vendor.id) {
      throw new ForbiddenException('Anda tidak berhak mengubah order ini');
    }
  }
  //========================================================================================

  //============================ HELPER: HITUNG NOMINAL TAGIHAN AWAL ==============================
  private resolvePaymentAmount(
    paymentType: OrderPaymentType,
    vendorProduct: VendorProduct,
  ): number {
    if (paymentType === OrderPaymentType.FULL) {
      return vendorProduct.price;
    }
    return vendorProduct.minimumDp && vendorProduct.minimumDp > 0
      ? vendorProduct.minimumDp
      : vendorProduct.price;
  }
  //========================================================================================

  //============================ HELPER: GENERATE ORDER NUMBER UNIK ==============================
  private async generateUniqueOrderNumber(orderRepo: Repository<Order>): Promise<string> {
    for (let attempt = 0; attempt < 5; attempt++) {
      const candidate = this.buildOrderNumber();
      const existing = await orderRepo.findOne({ where: { orderNumber: candidate } });
      if (!existing) {
        return candidate;
      }
    }
    throw new BadRequestException('Gagal membuat order number unik, silakan coba lagi');
  }

  private buildOrderNumber(): string {
    const now = new Date();
    const yy = String(now.getFullYear()).slice(-2);
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const random = Math.random().toString(36).slice(2, 6).toUpperCase();
    return `PYW-${yy}${mm}${dd}-${random}`;
  }
  //========================================================================================

  private async getOrderOrThrow(id: string): Promise<Order> {

    const order = await this.orderRepository.findOne({
      where: { id },
      relations: { customer: true, vendor: true, vendorProduct: true },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

}
