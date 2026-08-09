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

const sampleBankAccount = {
  id: '1',
  bankName: 'BCA',
  accountNumber: '1234567890',
  accountHolderName: 'John Doe',
  isPrimary: true,
  active: true,
  createdBy: null,
  createdAt: '2026-08-01T08:00:00.000Z',
  modifiedBy: null,
  modifiedAt: null,
};

export function ApiGetAllBankAccount() {
  return applyDecorators(
    ApiOperation({ summary: 'Get All Bank Account By User (Pagination)' }),
    ApiQuery({ name: 'pageNumber', required: false, type: Number, example: 1 }),
    ApiQuery({ name: 'pageSize', required: false, type: Number, example: 10 }),
    ApiOkResponse({
      description: 'Berhasil mengambil semua rekening milik user',
      schema: {
        example: {
          statusCode: 200,
          message: 'Success Get All Bank Account',
          data: {
            data: [sampleBankAccount],
            total: 1,
            pageNumber: 1,
            pageSize: 10,
          },
        },
      },
    }),
  );
}

export function ApiGetBankAccountById() {
  return applyDecorators(
    ApiOperation({ summary: 'Get Bank Account By Id' }),
    ApiOkResponse({
      description: 'Berhasil mengambil data rekening',
      schema: {
        example: {
          statusCode: 200,
          message: 'Success Get Bank Account By Id',
          data: sampleBankAccount,
        },
      },
    }),
    ApiNotFoundResponse({
      description: 'Bank account tidak ditemukan',
      schema: {
        example: {
          statusCode: 404,
          message: 'Bank account not found',
          error: 'Not Found',
        },
      },
    }),
  );
}

export function ApiCreateBankAccount() {
  return applyDecorators(
    ApiOperation({
      summary: 'Create Bank Account (rekening utama, satu per user)',
    }),
    ApiCreatedResponse({
      description: 'Berhasil membuat rekening baru',
      schema: {
        example: {
          statusCode: 201,
          message: 'Success Create Bank Account',
          data: sampleBankAccount,
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
      description: 'User sudah memiliki rekening utama',
      schema: {
        example: {
          statusCode: 409,
          message:
            'User already has a primary bank account, use update instead',
          error: 'Conflict',
        },
      },
    }),
  );
}

export function ApiUpdateBankAccount() {
  return applyDecorators(
    ApiOperation({ summary: 'Update Bank Account' }),
    ApiOkResponse({
      description: 'Berhasil mengupdate rekening',
      schema: {
        example: {
          statusCode: 200,
          message: 'Success Update Bank Account',
          data: sampleBankAccount,
        },
      },
    }),
    ApiNotFoundResponse({
      description: 'Bank account tidak ditemukan',
      schema: {
        example: {
          statusCode: 404,
          message: 'Bank account not found',
          error: 'Not Found',
        },
      },
    }),
  );
}

export function ApiDeleteBankAccount() {
  return applyDecorators(
    ApiOperation({ summary: 'Delete Bank Account' }),
    ApiNoContentResponse({ description: 'Berhasil menghapus rekening' }),
    ApiNotFoundResponse({
      description: 'Bank account tidak ditemukan',
      schema: {
        example: {
          statusCode: 404,
          message: 'Bank account not found',
          error: 'Not Found',
        },
      },
    }),
  );
}
