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

const sampleVerificationDocument = {
  id: '1',
  documentType: 'NIB',
  documentNumber: '1234567890123',
  status: 2,
  rejectReason: null,
  active: true,
  createdBy: null,
  createdAt: '2026-08-01T08:00:00.000Z',
  modifiedBy: null,
  modifiedAt: null,
};

export function ApiGetAllVerificationDocument() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get All Verification Document By User (Pagination)',
    }),
    ApiQuery({ name: 'pageNumber', required: false, type: Number, example: 1 }),
    ApiQuery({ name: 'pageSize', required: false, type: Number, example: 10 }),
    ApiOkResponse({
      description: 'Berhasil mengambil semua dokumen verifikasi milik user',
      schema: {
        example: {
          statusCode: 200,
          message: 'Success Get All Verification Document',
          data: {
            data: [sampleVerificationDocument],
            total: 1,
            pageNumber: 1,
            pageSize: 10,
          },
        },
      },
    }),
  );
}

export function ApiGetVerificationDocumentById() {
  return applyDecorators(
    ApiOperation({ summary: 'Get Verification Document By Id' }),
    ApiOkResponse({
      description: 'Berhasil mengambil data dokumen verifikasi',
      schema: {
        example: {
          statusCode: 200,
          message: 'Success Get Verification Document By Id',
          data: sampleVerificationDocument,
        },
      },
    }),
    ApiNotFoundResponse({
      description: 'Dokumen verifikasi tidak ditemukan',
      schema: {
        example: {
          statusCode: 404,
          message: 'Verification document not found',
          error: 'Not Found',
        },
      },
    }),
  );
}

export function ApiCreateVerificationDocument() {
  return applyDecorators(
    ApiOperation({
      summary: 'Create Verification Document (opsional sekaligus upload file)',
    }),
    ApiBody({
      schema: {
        type: 'object',
        required: ['documentType'],
        properties: {
          documentType: { type: 'string', example: 'NIB' },
          documentNumber: { type: 'string', example: '1234567890123' },
          file: { type: 'string', format: 'binary' },
        },
      },
    }),
    ApiCreatedResponse({
      description: 'Berhasil membuat dokumen verifikasi baru',
      schema: {
        example: {
          statusCode: 201,
          message: 'Success Create Verification Document',
          data: sampleVerificationDocument,
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

export function ApiUpdateVerificationDocument() {
  return applyDecorators(
    ApiOperation({
      summary: 'Update Verification Document (mis. review status oleh admin)',
    }),
    ApiOkResponse({
      description: 'Berhasil mengupdate dokumen verifikasi',
      schema: {
        example: {
          statusCode: 200,
          message: 'Success Update Verification Document',
          data: { ...sampleVerificationDocument, status: 3 },
        },
      },
    }),
    ApiNotFoundResponse({
      description: 'Dokumen verifikasi tidak ditemukan',
      schema: {
        example: {
          statusCode: 404,
          message: 'Verification document not found',
          error: 'Not Found',
        },
      },
    }),
  );
}

export function ApiDeleteVerificationDocument() {
  return applyDecorators(
    ApiOperation({ summary: 'Delete Verification Document' }),
    ApiNoContentResponse({
      description: 'Berhasil menghapus dokumen verifikasi',
    }),
    ApiNotFoundResponse({
      description: 'Dokumen verifikasi tidak ditemukan',
      schema: {
        example: {
          statusCode: 404,
          message: 'Verification document not found',
          error: 'Not Found',
        },
      },
    }),
  );
}
