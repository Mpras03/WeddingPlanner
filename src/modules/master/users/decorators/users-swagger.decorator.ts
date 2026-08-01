import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiConflictResponse,
  ApiQuery,
} from '@nestjs/swagger';

export function ApiGetAllUsers() {
  return applyDecorators(
    ApiOperation({ summary: 'Get All Users' }),
    ApiQuery({
      name: 'filter',
      required: false,
      type: String,
      description: 'Filter berdasarkan fullname atau email',
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
      description: 'Berhasil mengambil semua data user dengan pagination',
      schema: {
        example: {
          statusCode: 200,
          message: 'Success Get All Users',
          data: {
            data: [
              {
                id: 1,
                fullname: 'John Doe',
                email: 'johndoe@example.com',
                phoneNumber: '081234567890',
                isEmailVerified: false,
                isPhoneVerified: false,
                active: true,
                createdBy: null,
                createdAt: '2026-08-01T08:00:00.000Z',
                modifiedBy: null,
                modifiedAt: null,
                lastLoginAt: null,
              },
            ],
            total: 1,
            pageNumber: 1,
            pageSize: 10,
          },
        },
      },
    }),
  );
}

export function ApiGetUserById() {
  return applyDecorators(
    ApiOperation({ summary: 'Get User By Id' }),
    ApiOkResponse({
      description: 'Berhasil mengambil data user berdasarkan id',
      schema: {
        example: {
          statusCode: 200,
          message: 'Success Get User By Id',
          data: {
            id: 1,
            fullname: 'John Doe',
            email: 'johndoe@example.com',
            phoneNumber: '081234567890',
            isEmailVerified: false,
            isPhoneVerified: false,
            active: true,
            createdBy: null,
            createdAt: '2026-08-01T08:00:00.000Z',
            modifiedBy: null,
            modifiedAt: null,
            lastLoginAt: null,
          },
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

export function ApiCreateUser() {
  return applyDecorators(
    ApiOperation({ summary: 'Create User' }),
    ApiCreatedResponse({
      description: 'Berhasil membuat user baru',
      schema: {
        example: {
          statusCode: 201,
          message: 'Success Create User',
          data: {
            id: 2,
            fullname: 'Jane Doe',
            email: 'janedoe@example.com',
            phoneNumber: '081234567891',
            isEmailVerified: false,
            isPhoneVerified: false,
            active: true,
            createdBy: null,
            createdAt: '2026-08-01T10:00:00.000Z',
            modifiedBy: null,
            modifiedAt: null,
            lastLoginAt: null,
          },
        },
      },
    }),
    ApiConflictResponse({
      description: 'Email sudah terdaftar',
      schema: {
        example: {
          statusCode: 400,
          message: 'Email already exists',
          error: 'Bad Request',
        },
      },
    }),
  );
}

export function ApiUpdateUser() {
  return applyDecorators(
    ApiOperation({ summary: 'Update User' }),
    ApiOkResponse({
      description: 'Berhasil mengupdate data user',
      schema: {
        example: {
          statusCode: 200,
          message: 'Success Update User',
          data: {
            id: 1,
            fullname: 'John Doe Updated',
            email: 'johndoe@example.com',
            phoneNumber: '081234567890',
            isEmailVerified: false,
            isPhoneVerified: false,
            active: true,
            createdBy: null,
            createdAt: '2026-08-01T08:00:00.000Z',
            modifiedBy: null,
            modifiedAt: '2026-08-01T11:00:00.000Z',
            lastLoginAt: null,
          },
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
      description: 'Email sudah dipakai user lain',
      schema: {
        example: {
          statusCode: 409,
          message: 'Email already exists',
          error: 'Conflict',
        },
      },
    }),
  );
}

export function ApiDeleteUser() {
  return applyDecorators(
    ApiOperation({ summary: 'Delete User' }),
    ApiNoContentResponse({ description: 'Berhasil menghapus user' }),
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