import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';

const exampleAttachment = {
  id: 1,
  referenceTable: 'vendor_profile',
  referenceId: 10,
  category: 'profile_photo',
  originalName: 'logo.png',
  storedName: '9f2c1c1e-7b1a-4b0e-8d3e-2a6f7e0c1234.png',
  storagePath: 'vendor_profile/10/9f2c1c1e-7b1a-4b0e-8d3e-2a6f7e0c1234.png',
  url: '/attachments/1/file',
  mimeType: 'image/png',
  sizeBytes: 20480,
  sortOrder: 0,
  description: null,
  active: true,
  createdAt: '2026-08-01T08:00:00.000Z',
  createdBy: '1',
  modifiedAt: null,
  modifiedBy: null,
};

export function ApiFindAllAttachment() {
  return applyDecorators(
    ApiOperation({ summary: 'Get All Attachment (Pagination)' }),
    ApiQuery({
      name: 'referenceTable',
      required: false,
      example: 'vendor_profile',
    }),
    ApiQuery({ name: 'referenceId', required: false, example: 10 }),
    ApiQuery({ name: 'category', required: false, example: 'profile_photo' }),
    ApiQuery({ name: 'pageNumber', required: false, example: 1 }),
    ApiQuery({ name: 'pageSize', required: false, example: 10 }),
    ApiResponse({
      status: 200,
      description: 'Success Get All Attachment',
      schema: {
        example: {
          statusCode: 200,
          message: 'Success Get All Attachment',
          data: {
            data: [exampleAttachment],
            total: 1,
            pageNumber: 1,
            pageSize: 10,
          },
        },
      },
    }),
  );
}

export function ApiFindOneAttachment() {
  return applyDecorators(
    ApiOperation({ summary: 'Get Attachment By Id' }),
    ApiResponse({
      status: 200,
      description: 'Success Get Attachment By Id',
      schema: {
        example: {
          statusCode: 200,
          message: 'Success Get Attachment By Id',
          data: exampleAttachment,
        },
      },
    }),
    ApiResponse({
      status: 404,
      description: 'Attachment Not Found',
      schema: {
        example: {
          statusCode: 404,
          message: 'Attachment not found',
          error: 'Not Found',
        },
      },
    }),
  );
}

export function ApiCreateAttachment() {
  return applyDecorators(
    ApiOperation({ summary: 'Upload Attachment' }),
    ApiBody({
      schema: {
        type: 'object',
        required: ['file', 'referenceTable', 'referenceId'],
        properties: {
          file: { type: 'string', format: 'binary' },
          referenceTable: { type: 'string', example: 'vendor_profile' },
          referenceId: { type: 'integer', example: 10 },
          category: { type: 'string', example: 'profile_photo' },
          description: { type: 'string', example: 'Foto profil vendor' },
          sortOrder: { type: 'integer', example: 0 },
        },
      },
    }),
    ApiResponse({
      status: 201,
      description: 'Success Upload Attachment',
      schema: {
        example: {
          statusCode: 201,
          message: 'Success Upload Attachment',
          data: exampleAttachment,
        },
      },
    }),
    ApiResponse({
      status: 400,
      description: 'Bad Request',
      schema: {
        example: {
          statusCode: 400,
          message: ['referenceTable should not be empty'],
          error: 'Bad Request',
        },
      },
    }),
  );
}

export function ApiUpdateAttachment() {
  return applyDecorators(
    ApiOperation({ summary: 'Update Attachment Metadata' }),
    ApiResponse({
      status: 200,
      description: 'Success Update Attachment',
      schema: {
        example: {
          statusCode: 200,
          message: 'Success Update Attachment',
          data: {
            ...exampleAttachment,
            modifiedAt: '2026-08-01T09:00:00.000Z',
            modifiedBy: '1',
          },
        },
      },
    }),
    ApiResponse({
      status: 404,
      description: 'Attachment Not Found',
      schema: {
        example: {
          statusCode: 404,
          message: 'Attachment not found',
          error: 'Not Found',
        },
      },
    }),
  );
}

export function ApiDeleteAttachment() {
  return applyDecorators(
    ApiOperation({ summary: 'Delete Attachment (removes stored file too)' }),
    ApiResponse({
      status: 200,
      description: 'Success Delete Attachment',
      schema: {
        example: {
          statusCode: 200,
          message: 'Success Delete Attachment',
          data: null,
        },
      },
    }),
    ApiResponse({
      status: 404,
      description: 'Attachment Not Found',
      schema: {
        example: {
          statusCode: 404,
          message: 'Attachment not found',
          error: 'Not Found',
        },
      },
    }),
  );
}

export function ApiGetAttachmentFile() {
  return applyDecorators(
    ApiOperation({ summary: 'Get Attachment File (binary/blob stream)' }),
    ApiResponse({ status: 200, description: 'Binary file stream' }),
    ApiResponse({
      status: 404,
      description: 'Attachment Not Found',
      schema: {
        example: {
          statusCode: 404,
          message: 'Attachment not found',
          error: 'Not Found',
        },
      },
    }),
  );
}
