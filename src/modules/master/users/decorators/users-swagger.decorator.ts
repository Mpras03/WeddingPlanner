import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiQuery,
} from '@nestjs/swagger';

export function ApiGetAllUsers() {
  return applyDecorators(
    ApiOperation({ summary: 'Get All Users' }),
    ApiQuery({
      name: 'filter',
      required: false,
      type: String,
      description: 'Filter berdasarkan username atau name',
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
            items: [
              {
                id: 1,
                username: 'johndoe',
                name: 'John Doe',
                createdAt: '2026-07-20T08:00:00.000Z',
                updatedAt: '2026-07-20T08:00:00.000Z',
              },
            ],
            meta: {
              totalItems: 25,
              totalPages: 3,
              pageNumber: 1,
              pageSize: 10,
            },
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
            username: 'johndoe',
            name: 'John Doe',
            createdAt: '2026-07-20T08:00:00.000Z',
            updatedAt: '2026-07-20T08:00:00.000Z',
          },
        },
      },
    }),
    ApiNotFoundResponse({ description: 'User tidak ditemukan' }),
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
            username: 'janedoe',
            name: 'Jane Doe',
            createdAt: '2026-07-25T10:00:00.000Z',
            updatedAt: '2026-07-25T10:00:00.000Z',
          },
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
            username: 'johndoe',
            name: 'John Doe Updated',
            createdAt: '2026-07-20T08:00:00.000Z',
            updatedAt: '2026-07-25T10:15:00.000Z',
          },
        },
      },
    }),
    ApiNotFoundResponse({ description: 'User tidak ditemukan' }),
  );
}

export function ApiDeleteUser() {
  return applyDecorators(
    ApiOperation({ summary: 'Delete User' }),
    ApiNoContentResponse({ description: 'Berhasil menghapus user' }),
    ApiNotFoundResponse({ description: 'User tidak ditemukan' }),
  );
}