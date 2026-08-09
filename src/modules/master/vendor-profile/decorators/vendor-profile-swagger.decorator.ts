import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiQuery,
  ApiBody,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiConflictResponse,
} from '@nestjs/swagger';

const sampleVendorProfile = {
  id: 1,
  user: {
    id: 3,
    email: 'vendor@kencana-wo.com',
    fullname: 'John Doe',
  },
  businessName: 'Kencana Wedding Organizer',
  ownerName: 'John Doe',
  businessEmail: 'business@kencana-wo.com',
  businessPhone: '081234567890',
  businessAddress: 'Jl. Sudirman No. 45',
  city: 'Jakarta',
  province: 'DKI Jakarta',
  latitude: -6.2088,
  longitude: 106.8456,
  description: 'Vendor spesialis dekorasi dan katering pernikahan',
  serviceArea: 'Jabodetabek',
  logoUrl: 'https://cdn.example.com/logo/kencana-wo.jpg',
  categories: 'Catering,Wedding Organizer,Decoration',
  status: 1,
  rejectReason: null,
  isVerified: false,
  active: true,
  createdBy: null,
  createdAt: '2026-08-01T08:00:00.000Z',
  updatedBy: null,
  updatedAt: null,
};

const sampleAggregatedVendorProfile = {
  ...sampleVendorProfile,
  categories: ['Catering', 'Wedding Organizer', 'Decoration'],
  contacts: [
    {
      id: '1',
      contactType: 'WhatsApp',
      contactValue: '6281234567890',
      active: true,
    },
  ],
  bankAccounts: [
    {
      id: '1',
      bankName: 'BCA',
      accountNumber: '1234567890',
      accountHolderName: 'John Doe',
      isPrimary: true,
      active: true,
    },
  ],
  verificationDocuments: [
    {
      id: '1',
      documentType: 'NIB',
      documentNumber: '1234567890123',
      status: 2,
      rejectReason: null,
      attachmentId: '10',
    },
  ],
  // Cuma id attachment yang dikirim — file aslinya di-load dari frontend lewat GET /attachments/:id/file (blob).
  portfolioAttachmentIds: ['20', '21'],
};

const saveVendorProfileBodySchema = {
  type: 'object',
  required: ['userId'],
  properties: {
    userId: { type: 'integer', example: 1 },
    businessName: { type: 'string', example: 'Kencana Wedding Organizer' },
    ownerName: { type: 'string', example: 'John Doe' },
    businessEmail: { type: 'string', example: 'business@kencana-wo.com' },
    businessPhone: { type: 'string', example: '081234567890' },
    businessAddress: { type: 'string', example: 'Jl. Sudirman No. 45' },
    city: { type: 'string', example: 'Jakarta' },
    province: { type: 'string', example: 'DKI Jakarta' },
    latitude: { type: 'number', example: -6.2088 },
    longitude: { type: 'number', example: 106.8456 },
    description: {
      type: 'string',
      example: 'Vendor spesialis dekorasi dan katering pernikahan',
    },
    serviceArea: { type: 'string', example: 'Jabodetabek' },
    logoUrl: {
      type: 'string',
      example: 'https://cdn.example.com/logo/kencana-wo.jpg',
    },
    categories: {
      type: 'string',
      description: 'JSON array string, mis. ["Catering","Wedding Organizer"]',
      example: '["Catering","Wedding Organizer"]',
    },
    contacts: {
      type: 'string',
      description:
        'JSON array string, mis. [{"contactType":"WhatsApp","contactValue":"6281234567890"}]',
      example: '[{"contactType":"WhatsApp","contactValue":"6281234567890"}]',
    },
    bankAccount: {
      type: 'string',
      description:
        'JSON object string, mis. {"bankName":"BCA","accountNumber":"123","accountHolderName":"John Doe"}',
      example:
        '{"bankName":"BCA","accountNumber":"1234567890","accountHolderName":"John Doe"}',
    },
    verificationDocuments: {
      type: 'string',
      description:
        'JSON array string, mis. [{"documentType":"NIB","documentNumber":"123"}]',
      example: '[{"documentType":"NIB","documentNumber":"1234567890123"}]',
    },
    portfolioImages: {
      type: 'array',
      items: { type: 'string', format: 'binary' },
      description: 'File gambar portofolio (bisa lebih dari satu)',
    },
    verificationDocumentFiles: {
      type: 'array',
      items: { type: 'string', format: 'binary' },
      description:
        'File dokumen verifikasi, urutannya dipasangkan dengan array verificationDocuments',
    },
  },
};

export function ApiGetAllVendorProfile() {
  return applyDecorators(
    ApiOperation({ summary: 'Get All Vendor Profile' }),
    ApiQuery({
      name: 'filter',
      required: false,
      type: String,
      description: 'Filter berdasarkan businessName, ownerName, city, atau province',
      example: '',
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
      description: 'Berhasil mengambil semua data vendor profile dengan pagination',
      schema: {
        example: {
          statusCode: 200,
          message: 'Success Get All Vendor Profile',
          data: {
            data: [sampleVendorProfile],
            total: 1,
            pageNumber: 1,
            pageSize: 10,
          },
        },
      },
    }),
  );
}

export function ApiGetVendorProfileById() {
  return applyDecorators(
    ApiOperation({ summary: 'Get Vendor Profile By Id' }),
    ApiOkResponse({
      description: 'Berhasil mengambil data vendor profile berdasarkan id',
      schema: {
        example: {
          statusCode: 200,
          message: 'Success Get Vendor Profile By Id',
          data: sampleVendorProfile,
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

export function ApiGetVendorProfileByUserId() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get Vendor Profile By User Id',
      description:
        'Mengembalikan vendor profile beserta contacts, bankAccounts, verificationDocuments (masing-masing dengan attachmentId bila ada file terlampir), dan portfolioAttachmentIds. Attachment hanya dikirim sebagai id — file aslinya di-load terpisah lewat GET /attachments/:id/file (blob).',
    }),
    ApiOkResponse({
      description: 'Berhasil mengambil data vendor profile berdasarkan user id',
      schema: {
        example: {
          statusCode: 200,
          message: 'Success Get Vendor Profile By User Id',
          data: sampleAggregatedVendorProfile,
        },
      },
    }),
    ApiNotFoundResponse({
      description: 'Vendor profile tidak ditemukan untuk user ini',
      schema: {
        example: {
          statusCode: 404,
          message: 'Vendor profile not found for this user',
          error: 'Not Found',
        },
      },
    }),
  );
}

export function ApiCreateVendorProfile() {
  return applyDecorators(
    ApiOperation({ summary: 'Create Vendor Profile' }),
    ApiCreatedResponse({
      description: 'Berhasil membuat vendor profile baru',
      schema: {
        example: {
          statusCode: 201,
          message: 'Success Create Vendor Profile',
          data: sampleVendorProfile,
        },
      },
    }),
    ApiNotFoundResponse({
      description: 'User tidak ditemukan',
      schema: {
        example: {
          statusCode: 404,
          message: 'User not found',
          error: 'Not Found',
        },
      },
    }),
    ApiConflictResponse({
      description: 'User sudah memiliki vendor profile',
      schema: {
        example: {
          statusCode: 409,
          message: 'User already has a vendor profile',
          error: 'Conflict',
        },
      },
    }),
  );
}

export function ApiUpdateVendorProfile() {
  return applyDecorators(
    ApiOperation({ summary: 'Update Vendor Profile' }),
    ApiOkResponse({
      description: 'Berhasil mengupdate vendor profile',
      schema: {
        example: {
          statusCode: 200,
          message: 'Success Update Vendor Profile',
          data: {
            ...sampleVendorProfile,
            status: 2,
            isVerified: true,
            updatedAt: '2026-08-01T11:00:00.000Z',
          },
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

export function ApiDeleteVendorProfile() {
  return applyDecorators(
    ApiOperation({ summary: 'Delete Vendor Profile' }),
    ApiNoContentResponse({ description: 'Berhasil menghapus vendor profile' }),
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

export function ApiSaveDraftVendorProfile() {
  return applyDecorators(
    ApiOperation({
      summary: 'Save Draft Vendor Profile',
      description:
        'Upsert vendor profile (kategori, portofolio, logo, kontak, rekening utama, dokumen verifikasi) dengan status selalu di-set ke Draft (1), terlepas dari status sebelumnya.',
    }),
    ApiBody({ schema: saveVendorProfileBodySchema }),
    ApiCreatedResponse({
      description: 'Berhasil menyimpan draft vendor profile',
      schema: {
        example: {
          statusCode: 201,
          message: 'Success Save Draft Vendor Profile',
          data: { ...sampleAggregatedVendorProfile, status: 1 },
        },
      },
    }),
    ApiNotFoundResponse({
      description: 'User tidak ditemukan',
      schema: {
        example: {
          statusCode: 404,
          message: 'User not found',
          error: 'Not Found',
        },
      },
    }),
  );
}

export function ApiSubmitVendorProfile() {
  return applyDecorators(
    ApiOperation({
      summary: 'Submit Vendor Profile',
      description:
        'Upsert vendor profile sama seperti save-draft, tapi status selalu di-set ke Pending Verification (2) agar masuk antrean review admin.',
    }),
    ApiBody({ schema: saveVendorProfileBodySchema }),
    ApiCreatedResponse({
      description: 'Berhasil submit vendor profile untuk verifikasi',
      schema: {
        example: {
          statusCode: 201,
          message: 'Success Submit Vendor Profile',
          data: { ...sampleAggregatedVendorProfile, status: 2 },
        },
      },
    }),
    ApiNotFoundResponse({
      description: 'User tidak ditemukan',
      schema: {
        example: {
          statusCode: 404,
          message: 'User not found',
          error: 'Not Found',
        },
      },
    }),
  );
}
