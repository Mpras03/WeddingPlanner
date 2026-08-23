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

const sampleProfile = {
  id: 1,
  user: {
    id: 1,
    email: 'johndoe@example.com',
    fullname: 'John Doe',
  },
  fullName: 'John Doe',
  gender: 1,
  birthDate: '1995-08-17',
  avatarUrl: 'https://cdn.example.com/avatar/johndoe.jpg',
  address: 'Jl. Merdeka No. 10',
  city: 'Jakarta',
  province: 'DKI Jakarta',
  active: true,
  status: 1,
  createdBy: null,
  createdAt: '2026-08-01T08:00:00.000Z',
  modifiedBy: null,
  modifiedAt: null,
  weddingDate: '2027-06-20',
  eventType: 'AKAD_DAN_RESEPSI',
  weddingProvince: 'DKI Jakarta',
  weddingCity: 'Jakarta Selatan',
  weddingLocation: 'The Glass House, Jl. Gatot Subroto No. 10',
  weddingTheme: 'Modern romantic dengan nuansa putih dan dusty pink',
  estimatedGuests: 250,
  preferredVendorLocation: 'Jakarta dan sekitarnya',
  packagePreference: 'FULL_SERVICE',
  neededVendorCategories: ['Catering', 'Photography'],
  estimatedBudget: 250000000,
  budgetRangeMin: 200000000,
  budgetRangeMax: 300000000,
  budgetPriorities: ['Catering', 'Venue'],
};

const sampleAggregatedProfile = {
  ...sampleProfile,
  // Cuma id attachment yang dikirim — file aslinya di-load dari frontend lewat GET /attachments/:id/file (blob).
  avatarAttachmentId: '15',
};

const saveCustomerProfileBodySchema = {
  type: 'object',
  required: ['userId', 'fullName'],
  properties: {
    userId: { type: 'integer', example: 1 },
    fullName: { type: 'string', example: 'John Doe' },
    gender: { type: 'integer', example: 1 },
    birthDate: { type: 'string', example: '1995-08-17' },
    address: { type: 'string', example: 'Jl. Merdeka No. 10' },
    city: { type: 'string', example: 'Jakarta' },
    province: { type: 'string', example: 'DKI Jakarta' },
    weddingDate: { type: 'string', example: '2027-06-20' },
    eventType: {
      type: 'string',
      example: 'AKAD_DAN_RESEPSI',
      enum: ['AKAD', 'RESEPSI', 'AKAD_DAN_RESEPSI', 'LAINNYA'],
    },
    weddingProvince: { type: 'string', example: 'DKI Jakarta' },
    weddingCity: { type: 'string', example: 'Jakarta Selatan' },
    weddingLocation: {
      type: 'string',
      example: 'The Glass House, Jl. Gatot Subroto No. 10',
    },
    weddingTheme: {
      type: 'string',
      example: 'Modern romantic dengan nuansa putih dan dusty pink',
    },
    estimatedGuests: { type: 'integer', example: 250 },
    preferredVendorLocation: { type: 'string', example: 'Jakarta dan sekitarnya' },
    packagePreference: {
      type: 'string',
      example: 'FULL_SERVICE',
      enum: ['FULL_SERVICE', 'PER_SERVICE', 'CUSTOM'],
    },
    neededVendorCategories: {
      type: 'string',
      description: 'JSON array string, mis. ["Catering","Photography"]',
      example: '["Catering","Photography"]',
    },
    estimatedBudget: { type: 'integer', example: 250000000 },
    budgetRangeMin: { type: 'integer', example: 200000000 },
    budgetRangeMax: { type: 'integer', example: 300000000 },
    budgetPriorities: {
      type: 'string',
      description: 'JSON array string, mis. ["Catering","Venue"]',
      example: '["Catering","Venue"]',
    },
    avatarPhoto: {
      type: 'string',
      format: 'binary',
      description: 'File foto profil (opsional, menggantikan foto lama bila diisi)',
    },
    removeAvatarPhoto: {
      type: 'boolean',
      example: false,
      description:
        'Hapus foto profil yang ada tanpa menggantinya dengan foto baru. Diabaikan kalau avatarPhoto turut dikirim.',
    },
  },
};

// Sama seperti saveCustomerProfileBodySchema, tapi tanpa userId (profile sudah diidentifikasi lewat :id).
const updateCustomerProfileBodyProperties = Object.fromEntries(
  Object.entries(saveCustomerProfileBodySchema.properties).filter(
    ([key]) => key !== 'userId',
  ),
);

export function ApiGetAllCustomerProfile() {
  return applyDecorators(
    ApiOperation({ summary: 'Get All Customer Profile' }),
    ApiQuery({
      name: 'filter',
      required: false,
      type: String,
      description: 'Filter berdasarkan fullName, city, atau province',
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
      description: 'Berhasil mengambil semua data customer profile dengan pagination',
      schema: {
        example: {
          statusCode: 200,
          message: 'Success Get All Customer Profile',
          data: {
            data: [sampleProfile],
            total: 1,
            pageNumber: 1,
            pageSize: 10,
          },
        },
      },
    }),
  );
}

export function ApiGetCustomerProfileById() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get Customer Profile By Id',
      description:
        'Mengembalikan customer profile beserta avatarAttachmentId, selaras dengan field yang diterima save-draft/submit. Attachment hanya dikirim sebagai id — file aslinya di-load terpisah lewat GET /attachments/:id/file (blob).',
    }),
    ApiOkResponse({
      description: 'Berhasil mengambil data customer profile berdasarkan id',
      schema: {
        example: {
          statusCode: 200,
          message: 'Success Get Customer Profile By Id',
          data: sampleAggregatedProfile,
        },
      },
    }),
    ApiNotFoundResponse({
      description: 'Customer profile tidak ditemukan',
      schema: {
        example: {
          statusCode: 404,
          message: 'Customer profile not found',
          error: 'Not Found',
        },
      },
    }),
  );
}

export function ApiGetCustomerProfileByUserId() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get Customer Profile By User Id',
      description:
        'Mengembalikan customer profile beserta avatarAttachmentId, selaras dengan field yang diterima save-draft/submit. Attachment hanya dikirim sebagai id — file aslinya di-load terpisah lewat GET /attachments/:id/file (blob).',
    }),
    ApiOkResponse({
      description: 'Berhasil mengambil data customer profile berdasarkan user id',
      schema: {
        example: {
          statusCode: 200,
          message: 'Success Get Customer Profile By User Id',
          data: sampleAggregatedProfile,
        },
      },
    }),
    ApiNotFoundResponse({
      description: 'Customer profile tidak ditemukan untuk user ini',
      schema: {
        example: {
          statusCode: 404,
          message: 'Customer profile not found for this user',
          error: 'Not Found',
        },
      },
    }),
  );
}

export function ApiCreateCustomerProfile() {
  return applyDecorators(
    ApiOperation({ summary: 'Create Customer Profile' }),
    ApiCreatedResponse({
      description: 'Berhasil membuat customer profile baru',
      schema: {
        example: {
          statusCode: 201,
          message: 'Success Create Customer Profile',
          data: sampleProfile,
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
      description: 'User sudah memiliki customer profile',
      schema: {
        example: {
          statusCode: 409,
          message: 'User already has a customer profile',
          error: 'Conflict',
        },
      },
    }),
  );
}

export function ApiUpdateCustomerProfile() {
  return applyDecorators(
    ApiOperation({
      summary: 'Update Customer Profile',
      description:
        'Pure update data customer profile (data pribadi, alamat, detail pernikahan, foto profil) tanpa mengubah status — mirip mekanisme save-draft, tapi hanya untuk profile yang sudah ada (dicari lewat :id) dan tidak melakukan upsert.',
    }),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          ...updateCustomerProfileBodyProperties,
          active: { type: 'boolean', example: true },
        },
      },
    }),
    ApiOkResponse({
      description: 'Berhasil mengupdate customer profile',
      schema: {
        example: {
          statusCode: 200,
          message: 'Success Update Customer Profile',
          data: {
            ...sampleProfile,
            fullName: 'John Doe Updated',
            modifiedAt: '2026-08-01T11:00:00.000Z',
          },
        },
      },
    }),
    ApiNotFoundResponse({
      description: 'Customer profile tidak ditemukan',
      schema: {
        example: {
          statusCode: 404,
          message: 'Customer profile not found',
          error: 'Not Found',
        },
      },
    }),
  );
}

export function ApiDeleteCustomerProfile() {
  return applyDecorators(
    ApiOperation({ summary: 'Delete Customer Profile' }),
    ApiNoContentResponse({ description: 'Berhasil menghapus customer profile' }),
    ApiNotFoundResponse({
      description: 'Customer profile tidak ditemukan',
      schema: {
        example: {
          statusCode: 404,
          message: 'Customer profile not found',
          error: 'Not Found',
        },
      },
    }),
  );
}

export function ApiSaveDraftCustomerProfile() {
  return applyDecorators(
    ApiOperation({
      summary: 'Save Draft Customer Profile',
      description:
        'Upsert customer profile (data pribadi, alamat, detail pernikahan, foto profil) dengan status selalu di-set ke Draft (1), terlepas dari status sebelumnya.',
    }),
    ApiBody({ schema: saveCustomerProfileBodySchema }),
    ApiCreatedResponse({
      description: 'Berhasil menyimpan draft customer profile',
      schema: {
        example: {
          statusCode: 201,
          message: 'Success Save Draft Customer Profile',
          data: { ...sampleAggregatedProfile, status: 1 },
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

export function ApiSubmitCustomerProfile() {
  return applyDecorators(
    ApiOperation({
      summary: 'Submit Customer Profile',
      description:
        'Upsert customer profile sama seperti save-draft, tapi status selalu di-set ke Pending Verification (2).',
    }),
    ApiBody({ schema: saveCustomerProfileBodySchema }),
    ApiCreatedResponse({
      description: 'Berhasil submit customer profile',
      schema: {
        example: {
          statusCode: 201,
          message: 'Success Submit Customer Profile',
          data: { ...sampleAggregatedProfile, status: 2 },
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