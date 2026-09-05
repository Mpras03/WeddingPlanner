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

const sampleReview = {
  id: '1',
  order: {
    id: '1',
    orderNumber: 'PYW-260601-A1B2',
  },
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
  rating: 5,
  comment: 'Pelayanan sangat memuaskan, makanan enak dan tepat waktu!',
  active: true,
  createdBy: null,
  createdAt: '2026-08-01T08:00:00.000Z',
  modifiedBy: null,
  modifiedAt: null,
};

const sampleAggregatedReview = {
  ...sampleReview,
  // Cuma id attachment yang dikirim — file aslinya di-load dari frontend lewat GET /attachments/:id/file (blob).
  imageAttachmentIds: ['50', '51'],
};

const createReviewBodySchema = {
  type: 'object',
  required: ['orderId', 'rating'],
  properties: {
    orderId: { type: 'integer', example: 1 },
    rating: { type: 'integer', example: 5, minimum: 1, maximum: 5 },
    comment: {
      type: 'string',
      example: 'Pelayanan sangat memuaskan, makanan enak dan tepat waktu!',
    },
    images: {
      type: 'array',
      items: { type: 'string', format: 'binary' },
      description: 'Foto ulasan (opsional, bisa lebih dari satu)',
    },
  },
};

export function ApiFindAllVendorProductReview() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get All Vendor Product Review',
      description: 'Ulasan bersifat publik — dipakai untuk menampilkan daftar ulasan di halaman detail produk.',
    }),
    ApiQuery({
      name: 'vendorProductId',
      required: false,
      type: Number,
      description: 'Filter berdasarkan id vendor product yang diulas',
      example: 1,
    }),
    ApiQuery({
      name: 'vendorId',
      required: false,
      type: Number,
      description: 'Filter berdasarkan id vendor profile pemilik produk',
      example: 1,
    }),
    ApiQuery({
      name: 'customerId',
      required: false,
      type: Number,
      description: 'Filter berdasarkan id customer profile penulis ulasan',
      example: 1,
    }),
    ApiQuery({
      name: 'orderId',
      required: false,
      type: Number,
      description: 'Filter berdasarkan id order yang diulas',
      example: 1,
    }),
    ApiQuery({
      name: 'rating',
      required: false,
      type: Number,
      description: 'Filter berdasarkan rating persis (1-5)',
      example: 5,
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
      description:
        'Berhasil mengambil semua data ulasan dengan pagination. ratingBreakdown menghitung jumlah ulasan per bintang (1-5) mengikuti filter yang sama (minus filter rating itu sendiri), cuma dari ulasan yang active=true.',
      schema: {
        example: {
          statusCode: 200,
          message: 'Success Get All Vendor Product Review',
          data: {
            data: [sampleAggregatedReview],
            total: 1,
            pageNumber: 1,
            pageSize: 10,
            ratingBreakdown: { 1: 0, 2: 0, 3: 1, 4: 2, 5: 5 },
          },
        },
      },
    }),
  );
}

export function ApiFindOneVendorProductReview() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get Vendor Product Review By Id',
      description:
        'Mengembalikan ulasan beserta imageAttachmentIds. Attachment hanya dikirim sebagai id — file aslinya di-load terpisah lewat GET /attachments/:id/file (blob).',
    }),
    ApiOkResponse({
      description: 'Berhasil mengambil data ulasan berdasarkan id',
      schema: {
        example: {
          statusCode: 200,
          message: 'Success Get Vendor Product Review By Id',
          data: sampleAggregatedReview,
        },
      },
    }),
    ApiNotFoundResponse({
      description: 'Ulasan tidak ditemukan',
      schema: {
        example: {
          statusCode: 404,
          message: 'Vendor product review not found',
          error: 'Not Found',
        },
      },
    }),
  );
}

export function ApiCreateVendorProductReview() {
  return applyDecorators(
    ApiOperation({
      summary: 'Create Vendor Product Review',
      description:
        'Customer membuat ulasan untuk order miliknya sendiri yang sudah COMPLETED ("verified purchase") — satu order cuma boleh diulas sekali. customer/vendor/vendorProduct pada ulasan selalu disnapshot dari order tersebut, bukan dari body.',
    }),
    ApiBody({ schema: createReviewBodySchema }),
    ApiCreatedResponse({
      description: 'Berhasil membuat ulasan baru',
      schema: {
        example: {
          statusCode: 201,
          message: 'Success Create Vendor Product Review',
          data: sampleAggregatedReview,
        },
      },
    }),
    ApiBadRequestResponse({
      description: 'Order belum berstatus COMPLETED, belum bisa diulas',
      schema: {
        example: {
          statusCode: 400,
          message: 'Order belum selesai, belum bisa diulas',
          error: 'Bad Request',
        },
      },
    }),
    ApiForbiddenResponse({
      description: 'Order yang diulas bukan milik caller sendiri',
      schema: {
        example: {
          statusCode: 403,
          message: 'Anda hanya dapat mengulas order milik sendiri',
          error: 'Forbidden',
        },
      },
    }),
    ApiConflictResponse({
      description: 'Order ini sudah pernah diulas sebelumnya',
      schema: {
        example: {
          statusCode: 409,
          message: 'Order ini sudah pernah diulas',
          error: 'Conflict',
        },
      },
    }),
    ApiNotFoundResponse({
      description: 'Customer profile milik user yang login, atau order yang diulas, tidak ditemukan',
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
