import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';

const parameterExample = {
  id: '1',
  code: 'GENDER',
  description: 'Parameter jenis kelamin',
  active: true,
  createdBy: null,
  createdAt: '2026-08-01T08:00:00.000Z',
  modifiedBy: null,
  modifiedAt: null,
  details: [
    {
      id: '1',
      code: 'MALE',
      description: 'Laki-laki',
      ordering: 1,
      active: true,
      createdBy: null,
      createdAt: '2026-08-01T08:00:00.000Z',
      modifiedBy: null,
      modifiedAt: null,
    },
    {
      id: '2',
      code: 'FEMALE',
      description: 'Perempuan',
      ordering: 2,
      active: true,
      createdBy: null,
      createdAt: '2026-08-01T08:00:00.000Z',
      modifiedBy: null,
      modifiedAt: null,
    },
  ],
};

const parameterDetailExample = {
  id: '1',
  code: 'MALE',
  description: 'Laki-laki',
  ordering: 1,
  active: true,
  createdBy: null,
  createdAt: '2026-08-01T08:00:00.000Z',
  modifiedBy: null,
  modifiedAt: null,
};

export function ApiFindAllParameter() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get All Parameter (Header beserta Detail, Pagination)',
    }),
    ApiQuery({
      name: 'filter',
      required: false,
      example: 'gender',
      description: 'Filter berdasarkan kode header parameter',
    }),
    ApiQuery({
      name: 'pageNumber',
      required: false,
      example: 1,
      description: 'Halaman yang ditampilkan',
    }),
    ApiQuery({
      name: 'pageSize',
      required: false,
      example: 10,
      description: 'Jumlah data per halaman',
    }),
    ApiResponse({
      status: 200,
      description: 'Success Get All Parameter',
      schema: {
        example: {
          statusCode: 200,
          message: 'Success Get All Parameter',
          data: {
            data: [parameterExample],
            total: 1,
            pageNumber: 1,
            pageSize: 10,
          },
        },
      },
    }),
  );
}

export function ApiFindOneParameter() {
  return applyDecorators(
    ApiOperation({ summary: 'Get Parameter By Id (Header beserta Detail)' }),
    ApiResponse({
      status: 200,
      description: 'Success Get Parameter By Id',
      schema: {
        example: {
          statusCode: 200,
          message: 'Success Get Parameter By Id',
          data: parameterExample,
        },
      },
    }),
    ApiResponse({
      status: 404,
      description: 'Parameter Not Found',
      schema: {
        example: {
          statusCode: 404,
          message: 'Parameter not found',
          error: 'Not Found',
        },
      },
    }),
  );
}

export function ApiFindOneParameterDetail() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get Parameter Detail By Id (Detail saja, tanpa Header)',
    }),
    ApiResponse({
      status: 200,
      description: 'Success Get Parameter Detail By Id',
      schema: {
        example: {
          statusCode: 200,
          message: 'Success Get Parameter Detail By Id',
          data: parameterDetailExample,
        },
      },
    }),
    ApiResponse({
      status: 404,
      description: 'Parameter Detail Not Found',
      schema: {
        example: {
          statusCode: 404,
          message: 'Parameter detail not found',
          error: 'Not Found',
        },
      },
    }),
  );
}

export function ApiCreateParameter() {
  return applyDecorators(
    ApiOperation({ summary: 'Create Parameter (Header beserta Detail)' }),
    ApiResponse({
      status: 201,
      description: 'Success Create Parameter',
      schema: {
        example: {
          statusCode: 201,
          message: 'Success Create Parameter',
          data: parameterExample,
        },
      },
    }),
    ApiResponse({
      status: 400,
      description: 'Bad Request',
      schema: {
        example: {
          statusCode: 400,
          message: ['code should not be empty'],
          error: 'Bad Request',
        },
      },
    }),
  );
}

export function ApiUpdateParameter() {
  return applyDecorators(
    ApiOperation({
      summary: 'Update Parameter (Header beserta Detail)',
      description:
        'Detail yang dikirim dengan id akan diupdate, tanpa id akan dibuat baru, dan detail lama yang tidak disertakan akan dihapus. Jika field details tidak dikirim sama sekali, detail yang sudah ada tidak akan diubah.',
    }),
    ApiResponse({
      status: 200,
      description: 'Success Update Parameter',
      schema: {
        example: {
          statusCode: 200,
          message: 'Success Update Parameter',
          data: parameterExample,
        },
      },
    }),
    ApiResponse({
      status: 404,
      description: 'Parameter Not Found',
      schema: {
        example: {
          statusCode: 404,
          message: 'Parameter not found',
          error: 'Not Found',
        },
      },
    }),
  );
}

export function ApiDeleteParameter() {
  return applyDecorators(
    ApiOperation({ summary: 'Delete Parameter (Header beserta Detail)' }),
    ApiResponse({
      status: 200,
      description: 'Success Delete Parameter',
      schema: {
        example: {
          statusCode: 200,
          message: 'Success Delete Parameter',
          data: null,
        },
      },
    }),
    ApiResponse({
      status: 404,
      description: 'Parameter Not Found',
      schema: {
        example: {
          statusCode: 404,
          message: 'Parameter not found',
          error: 'Not Found',
        },
      },
    }),
  );
}
