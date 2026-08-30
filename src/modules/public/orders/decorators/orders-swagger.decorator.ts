import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiQuery,
  ApiBody,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiForbiddenResponse,
  ApiConflictResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { OrderPaymentType, OrderStatus } from '../order-status.enum';
import { OrderPaymentInstallment, OrderPaymentStatus } from '../../order-payments/order-payment.enum';

const sampleOrder = {
  id: '1',
  orderNumber: 'PYW-260601-A1B2',
  customer: {
    id: 1,
    fullName: 'John Doe',
  },
  vendor: {
    id: 3,
    businessName: 'Kencana Wedding Organizer',
  },
  vendorProduct: {
    id: '1',
    name: 'Paket Catering Premium 500 Pax',
  },
  productName: 'Paket Catering Premium 500 Pax',
  productPrice: 250000000,
  productMinimumDp: 50000000,
  eventDate: '2027-06-20',
  eventLocation: 'The Glass House, Jl. Gatot Subroto No. 10, Jakarta Selatan',
  guestCount: 250,
  notes: 'Mohon konfirmasi ketersediaan tanggal sebelum H-30',
  paymentType: OrderPaymentType.DP,
  totalAmount: 250000000,
  status: OrderStatus.PENDING_PAYMENT,
  rejectReason: null,
  confirmedAt: null,
  completedAt: null,
  active: true,
  createdBy: null,
  createdAt: '2026-08-01T08:00:00.000Z',
  modifiedBy: null,
  modifiedAt: null,
};

const createOrderBodySchema = {
  type: 'object',
  required: ['vendorProductId', 'eventDate', 'eventLocation', 'paymentType'],
  properties: {
    vendorProductId: { type: 'integer', example: 1 },
    eventDate: { type: 'string', example: '2027-06-20' },
    eventLocation: {
      type: 'string',
      example: 'The Glass House, Jl. Gatot Subroto No. 10, Jakarta Selatan',
    },
    guestCount: { type: 'integer', example: 250 },
    notes: {
      type: 'string',
      example: 'Mohon konfirmasi ketersediaan tanggal sebelum H-30',
    },
    paymentType: {
      type: 'string',
      enum: Object.values(OrderPaymentType),
      example: OrderPaymentType.DP,
    },
  },
};

const sampleAggregatedOrder = {
  ...sampleOrder,
  payments: [
    {
      id: '1',
      installment: OrderPaymentInstallment.DP,
      amount: 50000000,
      bankName: 'BCA',
      accountNumber: '1234567890',
      accountHolderName: 'Kencana Wedding Organizer',
      status: OrderPaymentStatus.WAITING_PAYMENT,
      rejectReason: null,
      paidAt: null,
      verifiedAt: null,
      proofAttachmentId: null,
    },
  ],
};

export function ApiFindAllOrder() {
  return applyDecorators(
    ApiOperation({ summary: 'Get All Order' }),
    ApiQuery({
      name: 'filter',
      required: false,
      type: String,
      description: 'Filter berdasarkan orderNumber',
      example: '',
    }),
    ApiQuery({
      name: 'customerId',
      required: false,
      type: Number,
      description:
        'Filter berdasarkan id customer profile (untuk "Pesanan Saya"). Harus sama dengan customer profile milik caller sendiri — kalau tidak dikirim sama sekali, otomatis discope ke profile caller.',
      example: 1,
    }),
    ApiQuery({
      name: 'vendorId',
      required: false,
      type: Number,
      description:
        'Filter berdasarkan id vendor profile (untuk pesanan masuk vendor). Harus sama dengan vendor profile milik caller sendiri — kalau tidak dikirim sama sekali, otomatis discope ke profile caller.',
      example: 1,
    }),
    ApiQuery({
      name: 'status',
      required: false,
      enum: OrderStatus,
      description: 'Filter berdasarkan status order',
    }),
    ApiQuery({
      name: 'pageNumber',
      required: false,
      type: Number,
      description: 'Halaman yang ingin ditampilkan (default: 1)',
      example: 1,
    }),
    ApiQuery({
      name: 'pageSize',
      required: false,
      type: Number,
      description: 'Jumlah data per halaman (default: 10)',
      example: 10,
    }),
    ApiOkResponse({
      description: 'Berhasil mengambil semua data order dengan pagination',
      schema: {
        example: {
          statusCode: 200,
          message: 'Success Get All Order',
          data: {
            data: [sampleOrder],
            total: 1,
            pageNumber: 1,
            pageSize: 10,
          },
        },
      },
    }),
    ApiForbiddenResponse({
      description: 'customerId/vendorId yang dikirim bukan milik caller sendiri',
      schema: {
        example: {
          statusCode: 403,
          message: 'Anda hanya dapat melihat order milik sendiri',
          error: 'Forbidden',
        },
      },
    }),
  );
}

export function ApiFindOneOrder() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get Order By Id',
      description:
        'Mengembalikan order beserta daftar payments (order_payments) — dipakai untuk halaman detail order customer maupun vendor.',
    }),
    ApiOkResponse({
      description: 'Berhasil mengambil data order berdasarkan id',
      schema: {
        example: {
          statusCode: 200,
          message: 'Success Get Order By Id',
          data: sampleAggregatedOrder,
        },
      },
    }),
    ApiForbiddenResponse({
      description: 'Caller bukan customer pemilik order maupun vendor penerima order ini',
      schema: {
        example: {
          statusCode: 403,
          message: 'Anda tidak berhak mengakses order ini',
          error: 'Forbidden',
        },
      },
    }),
    ApiNotFoundResponse({
      description: 'Order tidak ditemukan',
      schema: {
        example: {
          statusCode: 404,
          message: 'Order not found',
          error: 'Not Found',
        },
      },
    }),
  );
}

export function ApiCreateOrder() {
  return applyDecorators(
    ApiOperation({
      summary: 'Create Order (checkout)',
      description:
        'Membuat order dari checkout marketplace, sekaligus membuat installment pembayaran pertama (DP atau FULL) berikut instruksi rekening tujuan (snapshot dari rekening utama vendor). Customer pemilik order selalu diambil dari token JWT (bukan dari body). Harga & vendor selalu ditentukan dari data vendor_products di server. Vendor harus aktif & berstatus VERIFIED, dan produknya harus ACTIVE.',
    }),
    ApiBody({ schema: createOrderBodySchema }),
    ApiCreatedResponse({
      description: 'Berhasil membuat order baru',
      schema: {
        example: {
          statusCode: 201,
          message: 'Success Create Order',
          data: sampleAggregatedOrder,
        },
      },
    }),
    ApiBadRequestResponse({
      description:
        'Produk tidak tersedia untuk dipesan, vendor belum aktif/terverifikasi, atau vendor belum melengkapi rekening bank utama',
      schema: {
        example: {
          statusCode: 400,
          message: 'Produk ini sedang tidak tersedia untuk dipesan',
          error: 'Bad Request',
        },
      },
    }),
    ApiNotFoundResponse({
      description: 'Customer profile milik user yang login, atau vendor product yang dipesan, tidak ditemukan',
      schema: {
        example: {
          statusCode: 404,
          message: 'Vendor product not found',
          error: 'Not Found',
        },
      },
    }),
  );
}

export function ApiConfirmOrder() {
  return applyDecorators(
    ApiOperation({
      summary: 'Konfirmasi Order (vendor menerima)',
      description: 'Vendor menerima pesanan yang sedang menunggu konfirmasi (WAITING_VENDOR_CONFIRMATION → CONFIRMED).',
    }),
    ApiOkResponse({
      description: 'Berhasil mengonfirmasi order',
      schema: {
        example: {
          statusCode: 200,
          message: 'Success Confirm Order',
          data: { ...sampleAggregatedOrder, status: OrderStatus.CONFIRMED, confirmedAt: '2026-08-02T11:00:00.000Z' },
        },
      },
    }),
    ApiBadRequestResponse({
      description: 'Order ini tidak sedang menunggu konfirmasi vendor',
      schema: {
        example: {
          statusCode: 400,
          message: 'Order ini tidak sedang menunggu konfirmasi vendor',
          error: 'Bad Request',
        },
      },
    }),
    ApiForbiddenResponse({
      description: 'Caller bukan vendor penerima order ini',
      schema: {
        example: {
          statusCode: 403,
          message: 'Anda tidak berhak mengubah order ini',
          error: 'Forbidden',
        },
      },
    }),
    ApiNotFoundResponse({
      description: 'Order tidak ditemukan',
      schema: {
        example: {
          statusCode: 404,
          message: 'Order not found',
          error: 'Not Found',
        },
      },
    }),
  );
}

export function ApiRejectOrder() {
  return applyDecorators(
    ApiOperation({
      summary: 'Tolak Order (vendor menolak)',
      description: 'Vendor menolak pesanan yang sedang menunggu konfirmasi (WAITING_VENDOR_CONFIRMATION → REJECTED_BY_VENDOR).',
    }),
    ApiBody({
      schema: {
        type: 'object',
        required: ['rejectReason'],
        properties: {
          rejectReason: { type: 'string', example: 'Tanggal yang diminta sudah penuh' },
        },
      },
    }),
    ApiOkResponse({
      description: 'Berhasil menolak order',
      schema: {
        example: {
          statusCode: 200,
          message: 'Success Reject Order',
          data: {
            ...sampleAggregatedOrder,
            status: OrderStatus.REJECTED_BY_VENDOR,
            rejectReason: 'Tanggal yang diminta sudah penuh',
          },
        },
      },
    }),
    ApiBadRequestResponse({
      description: 'Order ini tidak sedang menunggu konfirmasi vendor',
      schema: {
        example: {
          statusCode: 400,
          message: 'Order ini tidak sedang menunggu konfirmasi vendor',
          error: 'Bad Request',
        },
      },
    }),
    ApiForbiddenResponse({
      description: 'Caller bukan vendor penerima order ini',
      schema: {
        example: {
          statusCode: 403,
          message: 'Anda tidak berhak mengubah order ini',
          error: 'Forbidden',
        },
      },
    }),
    ApiNotFoundResponse({
      description: 'Order tidak ditemukan',
      schema: {
        example: {
          statusCode: 404,
          message: 'Order not found',
          error: 'Not Found',
        },
      },
    }),
  );
}

const orderNotFoundResponse = ApiNotFoundResponse({
  description: 'Order tidak ditemukan',
  schema: {
    example: {
      statusCode: 404,
      message: 'Order not found',
      error: 'Not Found',
    },
  },
});

const orderTransitionBadRequestResponse = ApiBadRequestResponse({
  description: 'Order tidak sedang berada di status yang bisa berpindah ke status tujuan',
  schema: {
    example: {
      statusCode: 400,
      message: 'Order tidak bisa berpindah dari status CONFIRMED ke IN_PROGRESS',
      error: 'Bad Request',
    },
  },
});

export function ApiStartOrder() {
  return applyDecorators(
    ApiOperation({
      summary: 'Mulai Kerjakan Order (vendor)',
      description: 'Vendor menandai order mulai dikerjakan (CONFIRMED → IN_PROGRESS).',
    }),
    ApiOkResponse({
      description: 'Berhasil memulai order',
      schema: {
        example: {
          statusCode: 200,
          message: 'Success Start Order',
          data: { ...sampleAggregatedOrder, status: OrderStatus.IN_PROGRESS },
        },
      },
    }),
    orderTransitionBadRequestResponse,
    ApiForbiddenResponse({
      description: 'Caller bukan vendor penerima order ini',
      schema: {
        example: {
          statusCode: 403,
          message: 'Anda tidak berhak mengubah order ini',
          error: 'Forbidden',
        },
      },
    }),
    orderNotFoundResponse,
  );
}

export function ApiDeliverOrder() {
  return applyDecorators(
    ApiOperation({
      summary: 'Tandai Layanan Selesai Dikerjakan (vendor)',
      description:
        'Vendor menandai layanan sudah selesai dikerjakan, menunggu konfirmasi customer (IN_PROGRESS → WAITING_CUSTOMER_CONFIRMATION).',
    }),
    ApiOkResponse({
      description: 'Berhasil menandai layanan selesai dikerjakan',
      schema: {
        example: {
          statusCode: 200,
          message: 'Success Deliver Order',
          data: { ...sampleAggregatedOrder, status: OrderStatus.WAITING_CUSTOMER_CONFIRMATION },
        },
      },
    }),
    orderTransitionBadRequestResponse,
    ApiForbiddenResponse({
      description: 'Caller bukan vendor penerima order ini',
      schema: {
        example: {
          statusCode: 403,
          message: 'Anda tidak berhak mengubah order ini',
          error: 'Forbidden',
        },
      },
    }),
    orderNotFoundResponse,
  );
}

export function ApiCompleteOrder() {
  return applyDecorators(
    ApiOperation({
      summary: 'Selesaikan Order (customer mengonfirmasi)',
      description:
        'Customer mengonfirmasi layanan diterima dengan baik (WAITING_CUSTOMER_CONFIRMATION → COMPLETED). Ditolak kalau masih ada sisa tagihan yang belum lunas.',
    }),
    ApiOkResponse({
      description: 'Berhasil menyelesaikan order',
      schema: {
        example: {
          statusCode: 200,
          message: 'Success Complete Order',
          data: { ...sampleAggregatedOrder, status: OrderStatus.COMPLETED, completedAt: '2026-08-03T10:00:00.000Z' },
        },
      },
    }),
    ApiBadRequestResponse({
      description: 'Order belum berada di status yang tepat, atau masih ada sisa tagihan yang belum lunas',
      schema: {
        example: {
          statusCode: 400,
          message: 'Masih ada sisa tagihan yang belum lunas, order belum bisa diselesaikan',
          error: 'Bad Request',
        },
      },
    }),
    ApiForbiddenResponse({
      description: 'Caller bukan customer pemilik order ini',
      schema: {
        example: {
          statusCode: 403,
          message: 'Anda tidak berhak mengubah order ini',
          error: 'Forbidden',
        },
      },
    }),
    orderNotFoundResponse,
  );
}

export function ApiCancelOrder() {
  return applyDecorators(
    ApiOperation({
      summary: 'Batalkan Order (customer)',
      description: 'Customer membatalkan order miliknya sendiri (PENDING_PAYMENT atau CONFIRMED → CANCELLED).',
    }),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          reason: { type: 'string', example: 'Berubah rencana, tidak jadi menggunakan vendor ini' },
        },
      },
    }),
    ApiOkResponse({
      description: 'Berhasil membatalkan order',
      schema: {
        example: {
          statusCode: 200,
          message: 'Success Cancel Order',
          data: { ...sampleAggregatedOrder, status: OrderStatus.CANCELLED },
        },
      },
    }),
    orderTransitionBadRequestResponse,
    ApiForbiddenResponse({
      description: 'Caller bukan customer pemilik order ini',
      schema: {
        example: {
          statusCode: 403,
          message: 'Anda tidak berhak mengubah order ini',
          error: 'Forbidden',
        },
      },
    }),
    orderNotFoundResponse,
  );
}

export function ApiDisputeOrder() {
  return applyDecorators(
    ApiOperation({
      summary: 'Ajukan Sengketa (customer atau vendor)',
      description:
        'Customer atau vendor pemilik order mengajukan sengketa (CONFIRMED/IN_PROGRESS/WAITING_CUSTOMER_CONFIRMATION → DISPUTED).',
    }),
    ApiBody({
      schema: {
        type: 'object',
        required: ['reason'],
        properties: {
          reason: { type: 'string', example: 'Vendor tidak hadir sesuai jadwal yang disepakati' },
        },
      },
    }),
    ApiOkResponse({
      description: 'Berhasil mengajukan sengketa',
      schema: {
        example: {
          statusCode: 200,
          message: 'Success Dispute Order',
          data: { ...sampleAggregatedOrder, status: OrderStatus.DISPUTED, rejectReason: 'Vendor tidak hadir sesuai jadwal yang disepakati' },
        },
      },
    }),
    orderTransitionBadRequestResponse,
    ApiForbiddenResponse({
      description: 'Caller bukan customer pemilik order maupun vendor penerima order ini',
      schema: {
        example: {
          statusCode: 403,
          message: 'Anda tidak berhak mengakses order ini',
          error: 'Forbidden',
        },
      },
    }),
    orderNotFoundResponse,
  );
}

export function ApiResolveDisputeOrder() {
  return applyDecorators(
    ApiOperation({
      summary: 'Selesaikan Sengketa (admin)',
      description: 'Menutup sengketa (DISPUTED → COMPLETED atau CANCELLED, tergantung hasil mediasi).',
    }),
    ApiBody({
      schema: {
        type: 'object',
        required: ['status'],
        properties: {
          status: { type: 'string', enum: [OrderStatus.COMPLETED, OrderStatus.CANCELLED], example: OrderStatus.COMPLETED },
          note: { type: 'string', example: 'Vendor sudah menyelesaikan kewajiban sesuai kesepakatan, sengketa ditutup' },
        },
      },
    }),
    ApiOkResponse({
      description: 'Berhasil menyelesaikan sengketa',
      schema: {
        example: {
          statusCode: 200,
          message: 'Success Resolve Order Dispute',
          data: { ...sampleAggregatedOrder, status: OrderStatus.COMPLETED },
        },
      },
    }),
    orderTransitionBadRequestResponse,
    orderNotFoundResponse,
  );
}

export function ApiCreateRemainingPayment() {
  return applyDecorators(
    ApiOperation({
      summary: 'Buat Tagihan Pelunasan (customer)',
      description:
        'Membuat installment REMAINING senilai sisa tagihan (totalAmount dikurangi jumlah yang sudah PAID), dengan rekening tujuan di-snapshot ulang dari rekening utama vendor saat ini. Cuma bisa dibuat sekali per order.',
    }),
    ApiCreatedResponse({
      description: 'Berhasil membuat tagihan pelunasan',
      schema: {
        example: {
          statusCode: 201,
          message: 'Success Create Remaining Payment',
          data: sampleAggregatedOrder,
        },
      },
    }),
    ApiBadRequestResponse({
      description: 'Belum ada pembayaran yang lunas, atau order sudah lunas sepenuhnya',
      schema: {
        example: {
          statusCode: 400,
          message: 'Order ini sudah lunas, tidak perlu pelunasan lagi',
          error: 'Bad Request',
        },
      },
    }),
    ApiForbiddenResponse({
      description: 'Caller bukan customer pemilik order ini',
      schema: {
        example: {
          statusCode: 403,
          message: 'Anda tidak berhak mengubah order ini',
          error: 'Forbidden',
        },
      },
    }),
    ApiConflictResponse({
      description: 'Tagihan pelunasan untuk order ini sudah pernah dibuat',
      schema: {
        example: {
          statusCode: 409,
          message: 'Tagihan pelunasan untuk order ini sudah pernah dibuat — kalau sebelumnya ditolak, submit ulang bukti transfer lewat endpoint proof',
          error: 'Conflict',
        },
      },
    }),
    orderNotFoundResponse,
  );
}
