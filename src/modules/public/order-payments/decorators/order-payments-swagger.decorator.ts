import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiQuery,
  ApiBody,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { OrderPaymentInstallment, OrderPaymentStatus } from '../order-payment.enum';

const sampleOrderPayment = {
  id: '1',
  order: {
    id: '1',
    orderNumber: 'PYW-260601-A1B2',
  },
  installment: OrderPaymentInstallment.DP,
  amount: 50000000,
  bankAccount: { id: '5' },
  bankName: 'BCA',
  accountNumber: '1234567890',
  accountHolderName: 'Kencana Wedding Organizer',
  status: OrderPaymentStatus.WAITING_PAYMENT,
  rejectReason: null,
  paidAt: null,
  verifiedAt: null,
  verifiedBy: null,
  active: true,
  createdBy: null,
  createdAt: '2026-08-01T08:00:00.000Z',
  modifiedBy: null,
  modifiedAt: null,
};

const sampleAggregatedOrderPayment = {
  ...sampleOrderPayment,
  // Cuma id attachment yang dikirim — file aslinya di-load dari frontend lewat GET /attachments/:id/file (blob).
  proofAttachmentId: null,
};

export function ApiFindAllOrderPayment() {
  return applyDecorators(
    ApiOperation({ summary: 'Get All Order Payment' }),
    ApiQuery({
      name: 'orderId',
      required: false,
      type: Number,
      description: 'Filter berdasarkan id order pemilik pembayaran ini',
      example: 1,
    }),
    ApiQuery({
      name: 'status',
      required: false,
      enum: OrderPaymentStatus,
      description: 'Filter berdasarkan status pembayaran',
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
      description: 'Berhasil mengambil semua data order payment dengan pagination',
      schema: {
        example: {
          statusCode: 200,
          message: 'Success Get All Order Payment',
          data: {
            data: [sampleAggregatedOrderPayment],
            total: 1,
            pageNumber: 1,
            pageSize: 10,
          },
        },
      },
    }),
  );
}

export function ApiFindOneOrderPayment() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get Order Payment By Id',
      description:
        'Mengembalikan order payment beserta proofAttachmentId. Attachment hanya dikirim sebagai id — file aslinya di-load terpisah lewat GET /attachments/:id/file (blob).',
    }),
    ApiOkResponse({
      description: 'Berhasil mengambil data order payment berdasarkan id',
      schema: {
        example: {
          statusCode: 200,
          message: 'Success Get Order Payment By Id',
          data: sampleAggregatedOrderPayment,
        },
      },
    }),
    ApiNotFoundResponse({
      description: 'Order payment tidak ditemukan',
      schema: {
        example: {
          statusCode: 404,
          message: 'Order payment not found',
          error: 'Not Found',
        },
      },
    }),
  );
}

export function ApiSubmitOrderPaymentProof() {
  return applyDecorators(
    ApiOperation({
      summary: 'Submit / Upload Ulang Bukti Pembayaran',
      description:
        'Upload bukti transfer untuk installment pembayaran ini. Menggantikan bukti lama bila sebelumnya sudah ada (mis. setelah ditolak admin), dan mengubah status jadi WAITING_VERIFICATION.',
    }),
    ApiBody({
      schema: {
        type: 'object',
        required: ['proof'],
        properties: {
          proof: {
            type: 'string',
            format: 'binary',
            description: 'File bukti transfer',
          },
        },
      },
    }),
    ApiOkResponse({
      description: 'Berhasil mengirim bukti pembayaran',
      schema: {
        example: {
          statusCode: 200,
          message: 'Success Submit Payment Proof',
          data: {
            ...sampleAggregatedOrderPayment,
            status: OrderPaymentStatus.WAITING_VERIFICATION,
            paidAt: '2026-08-02T09:00:00.000Z',
            proofAttachmentId: '40',
          },
        },
      },
    }),
    ApiNotFoundResponse({
      description: 'Order payment tidak ditemukan',
      schema: {
        example: {
          statusCode: 404,
          message: 'Order payment not found',
          error: 'Not Found',
        },
      },
    }),
  );
}

export function ApiVerifyOrderPayment() {
  return applyDecorators(
    ApiOperation({
      summary: 'Verifikasi Pembayaran (admin)',
      description:
        'Menandai pembayaran sebagai PAID. Kalau order masih PENDING_PAYMENT, order otomatis dimajukan ke WAITING_VENDOR_CONFIRMATION.',
    }),
    ApiOkResponse({
      description: 'Berhasil memverifikasi pembayaran',
      schema: {
        example: {
          statusCode: 200,
          message: 'Success Verify Order Payment',
          data: {
            ...sampleAggregatedOrderPayment,
            status: OrderPaymentStatus.PAID,
            verifiedAt: '2026-08-02T10:00:00.000Z',
            verifiedBy: '5',
          },
        },
      },
    }),
    ApiBadRequestResponse({
      description: 'Pembayaran ini tidak sedang menunggu verifikasi',
      schema: {
        example: {
          statusCode: 400,
          message: 'Pembayaran ini tidak sedang menunggu verifikasi',
          error: 'Bad Request',
        },
      },
    }),
    ApiNotFoundResponse({
      description: 'Order payment tidak ditemukan',
      schema: {
        example: {
          statusCode: 404,
          message: 'Order payment not found',
          error: 'Not Found',
        },
      },
    }),
  );
}

export function ApiRejectOrderPayment() {
  return applyDecorators(
    ApiOperation({
      summary: 'Tolak Pembayaran (admin)',
      description:
        'Menolak bukti pembayaran (mis. nominal tidak sesuai, atau "minta upload ulang"). Customer perlu submit ulang bukti lewat endpoint proof.',
    }),
    ApiBody({
      schema: {
        type: 'object',
        required: ['rejectReason'],
        properties: {
          rejectReason: {
            type: 'string',
            example: 'Nominal transfer tidak sesuai dengan tagihan',
          },
        },
      },
    }),
    ApiOkResponse({
      description: 'Berhasil menolak pembayaran',
      schema: {
        example: {
          statusCode: 200,
          message: 'Success Reject Order Payment',
          data: {
            ...sampleAggregatedOrderPayment,
            status: OrderPaymentStatus.REJECTED,
            rejectReason: 'Nominal transfer tidak sesuai dengan tagihan',
          },
        },
      },
    }),
    ApiBadRequestResponse({
      description: 'Pembayaran ini tidak sedang menunggu verifikasi',
      schema: {
        example: {
          statusCode: 400,
          message: 'Pembayaran ini tidak sedang menunggu verifikasi',
          error: 'Bad Request',
        },
      },
    }),
    ApiNotFoundResponse({
      description: 'Order payment tidak ditemukan',
      schema: {
        example: {
          statusCode: 404,
          message: 'Order payment not found',
          error: 'Not Found',
        },
      },
    }),
  );
}
