import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiQuery,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';

const sampleContact = {
  id: '1',
  contactType: 'WhatsApp',
  contactValue: '6281234567890',
  active: true,
  createdBy: null,
  createdAt: '2026-08-01T08:00:00.000Z',
  modifiedBy: null,
  modifiedAt: null,
};

export function ApiGetAllContact() {
  return applyDecorators(
    ApiOperation({ summary: 'Get All Contact By User (Pagination)' }),
    ApiQuery({ name: 'pageNumber', required: false, type: Number, example: 1 }),
    ApiQuery({ name: 'pageSize', required: false, type: Number, example: 10 }),
    ApiOkResponse({
      description: 'Berhasil mengambil semua kontak milik user',
      schema: {
        example: {
          statusCode: 200,
          message: 'Success Get All Contact',
          data: {
            data: [sampleContact],
            total: 1,
            pageNumber: 1,
            pageSize: 10,
          },
        },
      },
    }),
  );
}

export function ApiGetContactById() {
  return applyDecorators(
    ApiOperation({ summary: 'Get Contact By Id' }),
    ApiOkResponse({
      description: 'Berhasil mengambil data kontak',
      schema: {
        example: {
          statusCode: 200,
          message: 'Success Get Contact By Id',
          data: sampleContact,
        },
      },
    }),
    ApiNotFoundResponse({
      description: 'Contact tidak ditemukan',
      schema: {
        example: {
          statusCode: 404,
          message: 'Contact not found',
          error: 'Not Found',
        },
      },
    }),
  );
}

export function ApiCreateContact() {
  return applyDecorators(
    ApiOperation({ summary: 'Create Contact' }),
    ApiCreatedResponse({
      description: 'Berhasil membuat kontak baru',
      schema: {
        example: {
          statusCode: 201,
          message: 'Success Create Contact',
          data: sampleContact,
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

export function ApiUpdateContact() {
  return applyDecorators(
    ApiOperation({ summary: 'Update Contact' }),
    ApiOkResponse({
      description: 'Berhasil mengupdate kontak',
      schema: {
        example: {
          statusCode: 200,
          message: 'Success Update Contact',
          data: sampleContact,
        },
      },
    }),
    ApiNotFoundResponse({
      description: 'Contact tidak ditemukan',
      schema: {
        example: {
          statusCode: 404,
          message: 'Contact not found',
          error: 'Not Found',
        },
      },
    }),
  );
}

export function ApiDeleteContact() {
  return applyDecorators(
    ApiOperation({ summary: 'Delete Contact' }),
    ApiNoContentResponse({ description: 'Berhasil menghapus kontak' }),
    ApiNotFoundResponse({
      description: 'Contact tidak ditemukan',
      schema: {
        example: {
          statusCode: 404,
          message: 'Contact not found',
          error: 'Not Found',
        },
      },
    }),
  );
}
