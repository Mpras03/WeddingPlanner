import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';

export function ApiFindAllRole() {
  return applyDecorators(
    ApiOperation({ summary: 'Get All Role (Pagination)' }),
    ApiQuery({ name: 'filter', required: false, example: 'admin', description: 'Filter berdasarkan nama role' }),
    ApiQuery({ name: 'pageNumber', required: false, example: 1, description: 'Halaman yang ditampilkan' }),
    ApiQuery({ name: 'pageSize', required: false, example: 10, description: 'Jumlah data per halaman' }),
    ApiResponse({
      status: 200,
      description: 'Success Get All Role',
      schema: {
        example: {
          statusCode: 200,
          message: 'Success Get All Role',
          data: {
            data: [
              {
                id: 1,
                roleName: 'Administrator',
                description: 'Administrator System',
                active: true,
                createdBy: null,
                createdAt: '2026-08-01T08:00:00.000Z',
                updatedBy: null,
                updatedAt: null,
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

export function ApiFindOneRole() {
  return applyDecorators(
    ApiOperation({ summary: 'Get Role By Id' }),
    ApiResponse({
      status: 200,
      description: 'Success Get Role By Id',
      schema: {
        example: {
          statusCode: 200,
          message: 'Success Get Role By Id',
          data: {
            id: 1,
            roleName: 'Administrator',
            description: 'Administrator System',
            active: true,
            createdBy: null,
            createdAt: '2026-08-01T08:00:00.000Z',
            updatedBy: null,
            updatedAt: null,
          },
        },
      },
    }),
    ApiResponse({
      status: 404,
      description: 'Role Not Found',
      schema: {
        example: {
          statusCode: 404,
          message: 'Role not found',
          error: 'Not Found',
        },
      },
    }),
  );
}

export function ApiCreateRole() {
  return applyDecorators(
    ApiOperation({ summary: 'Create Role' }),
    ApiResponse({
      status: 201,
      description: 'Success Create Role',
      schema: {
        example: {
          statusCode: 201,
          message: 'Success Create Role',
          data: {
            id: 1,
            roleName: 'Administrator',
            description: 'Administrator System',
            active: true,
            createdBy: null,
            createdAt: '2026-08-01T08:00:00.000Z',
            updatedBy: null,
            updatedAt: null,
          },
        },
      },
    }),
    ApiResponse({
      status: 400,
      description: 'Bad Request',
      schema: {
        example: {
          statusCode: 400,
          message: ['roleName should not be empty'],
          error: 'Bad Request',
        },
      },
    }),
  );
}

export function ApiUpdateRole() {
  return applyDecorators(
    ApiOperation({ summary: 'Update Role' }),
    ApiResponse({
      status: 200,
      description: 'Success Update Role',
      schema: {
        example: {
          statusCode: 200,
          message: 'Success Update Role',
          data: {
            id: 1,
            roleName: 'Administrator',
            description: 'Administrator System',
            active: true,
            createdBy: null,
            createdAt: '2026-08-01T08:00:00.000Z',
            updatedBy: null,
            updatedAt: '2026-08-01T09:00:00.000Z',
          },
        },
      },
    }),
    ApiResponse({
      status: 404,
      description: 'Role Not Found',
      schema: {
        example: {
          statusCode: 404,
          message: 'Role not found',
          error: 'Not Found',
        },
      },
    }),
  );
}

export function ApiDeleteRole() {
  return applyDecorators(
    ApiOperation({ summary: 'Delete Role' }),
    ApiResponse({
      status: 200,
      description: 'Success Delete Role',
      schema: {
        example: {
          statusCode: 200,
          message: 'Success Delete Role',
          data: null,
        },
      },
    }),
    ApiResponse({
      status: 404,
      description: 'Role Not Found',
      schema: {
        example: {
          statusCode: 404,
          message: 'Role not found',
          error: 'Not Found',
        },
      },
    }),
  );
}