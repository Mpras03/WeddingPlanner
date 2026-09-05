import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiQuery,
  ApiBody,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { VendorProductStatus } from '../vendor-product-status.enum';

const sampleVendorProduct = {
  id: '1',
  vendor: {
    id: 3,
    businessName: 'Kencana Wedding Organizer',
  },
  category: 'Catering',
  name: 'Paket Catering Premium 500 Pax',
  description: 'Paket catering lengkap dengan live cooking station',
  price: 250000000,
  minimumDp: 50000000,
  duration: '8 jam',
  guestCapacity: 500,
  serviceArea: 'Jabodetabek',
  terms: 'Pembayaran DP 50% saat booking, pelunasan H-7 sebelum acara',
  status: VendorProductStatus.DRAFT,
  active: true,
  createdBy: null,
  createdAt: '2026-08-01T08:00:00.000Z',
  modifiedBy: null,
  modifiedAt: null,
};

const sampleAggregatedVendorProduct = {
  ...sampleVendorProduct,
  // Cuma id attachment yang dikirim — file aslinya di-load dari frontend lewat GET /attachments/:id/file (blob).
  imageAttachmentIds: ['20', '21'],
  // averageRating & reviewCount cuma dihitung dari ulasan yang active=true.
  // soldCount dihitung dari order berstatus COMPLETED untuk produk ini.
  averageRating: 4.75,
  reviewCount: 8,
  soldCount: 12,
};

const vendorProductBodySchema = {
  type: 'object',
  required: ['vendorId', 'name', 'price', 'status'],
  properties: {
    vendorId: { type: 'integer', example: 1 },
    category: { type: 'string', example: 'Catering' },
    name: { type: 'string', example: 'Paket Catering Premium 500 Pax' },
    description: {
      type: 'string',
      example: 'Paket catering lengkap dengan live cooking station',
    },
    price: { type: 'integer', example: 250000000 },
    minimumDp: { type: 'integer', example: 50000000 },
    duration: { type: 'string', example: '8 jam' },
    guestCapacity: { type: 'integer', example: 500 },
    serviceArea: { type: 'string', example: 'Jabodetabek' },
    terms: {
      type: 'string',
      example: 'Pembayaran DP 50% saat booking, pelunasan H-7 sebelum acara',
    },
    status: {
      type: 'string',
      enum: Object.values(VendorProductStatus),
      example: VendorProductStatus.DRAFT,
    },
    active: { type: 'boolean', example: true },
    images: {
      type: 'array',
      items: { type: 'string', format: 'binary' },
      description:
        'File gambar produk (bisa lebih dari satu, menggantikan semua gambar lama bila diisi)',
    },
  },
};

// Sama seperti vendorProductBodySchema, tapi tanpa vendorId (produk sudah diidentifikasi lewat :id).
const updateVendorProductBodyProperties = Object.fromEntries(
  Object.entries(vendorProductBodySchema.properties).filter(
    ([key]) => key !== 'vendorId',
  ),
);

export function ApiFindAllVendorProduct() {
  return applyDecorators(
    ApiOperation({ summary: 'Get All Vendor Product' }),
    ApiQuery({
      name: 'filter',
      required: false,
      type: String,
      description: 'Filter berdasarkan name atau category',
      example: '',
    }),
    ApiQuery({
      name: 'vendorId',
      required: false,
      type: Number,
      description: 'Filter berdasarkan id vendor profile pemilik produk',
      example: 1,
    }),
    ApiQuery({
      name: 'status',
      required: false,
      enum: VendorProductStatus,
      description: 'Filter berdasarkan status produk',
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
      description: 'Berhasil mengambil semua data vendor product dengan pagination',
      schema: {
        example: {
          statusCode: 200,
          message: 'Success Get All Vendor Product',
          data: {
            data: [sampleAggregatedVendorProduct],
            total: 1,
            pageNumber: 1,
            pageSize: 10,
          },
        },
      },
    }),
  );
}

export function ApiFindOneVendorProduct() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get Vendor Product By Id',
      description:
        'Mengembalikan vendor product beserta imageAttachmentIds. Attachment hanya dikirim sebagai id — file aslinya di-load terpisah lewat GET /attachments/:id/file (blob).',
    }),
    ApiOkResponse({
      description: 'Berhasil mengambil data vendor product berdasarkan id',
      schema: {
        example: {
          statusCode: 200,
          message: 'Success Get Vendor Product By Id',
          data: sampleAggregatedVendorProduct,
        },
      },
    }),
    ApiNotFoundResponse({
      description: 'Vendor product tidak ditemukan',
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

export function ApiCreateVendorProduct() {
  return applyDecorators(
    ApiOperation({ summary: 'Create Vendor Product' }),
    ApiBody({ schema: vendorProductBodySchema }),
    ApiCreatedResponse({
      description: 'Berhasil membuat vendor product baru',
      schema: {
        example: {
          statusCode: 201,
          message: 'Success Create Vendor Product',
          data: sampleAggregatedVendorProduct,
        },
      },
    }),
    ApiNotFoundResponse({
      description: 'Vendor profile tidak ditemukan',
      schema: {
        example: {
          statusCode: 404,
          message: 'Vendor profile not found',
          error: 'Not Found',
        },
      },
    }),
  );
}

export function ApiUpdateVendorProduct() {
  return applyDecorators(
    ApiOperation({
      summary: 'Update Vendor Product',
      description:
        'Update data vendor product — kirim images untuk mengganti semua gambar produk yang lama sekaligus.',
    }),
    ApiBody({
      schema: {
        type: 'object',
        properties: updateVendorProductBodyProperties,
      },
    }),
    ApiOkResponse({
      description: 'Berhasil mengupdate vendor product',
      schema: {
        example: {
          statusCode: 200,
          message: 'Success Update Vendor Product',
          data: {
            ...sampleAggregatedVendorProduct,
            name: 'Paket Catering Premium 500 Pax (Updated)',
            modifiedAt: '2026-08-01T11:00:00.000Z',
          },
        },
      },
    }),
    ApiNotFoundResponse({
      description: 'Vendor product tidak ditemukan',
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

export function ApiDeleteVendorProduct() {
  return applyDecorators(
    ApiOperation({ summary: 'Delete Vendor Product' }),
    ApiNoContentResponse({ description: 'Berhasil menghapus vendor product' }),
    ApiNotFoundResponse({
      description: 'Vendor product tidak ditemukan',
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
