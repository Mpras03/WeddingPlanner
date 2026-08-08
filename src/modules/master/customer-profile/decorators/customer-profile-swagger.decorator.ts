import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiQuery,
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
};

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
    ApiOperation({ summary: 'Get Customer Profile By Id' }),
    ApiOkResponse({
      description: 'Berhasil mengambil data customer profile berdasarkan id',
      schema: {
        example: {
          statusCode: 200,
          message: 'Success Get Customer Profile By Id',
          data: sampleProfile,
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
    ApiOperation({ summary: 'Get Customer Profile By User Id' }),
    ApiOkResponse({
      description: 'Berhasil mengambil data customer profile berdasarkan user id',
      schema: {
        example: {
          statusCode: 200,
          message: 'Success Get Customer Profile By User Id',
          data: sampleProfile,
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
    ApiOperation({ summary: 'Update Customer Profile' }),
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