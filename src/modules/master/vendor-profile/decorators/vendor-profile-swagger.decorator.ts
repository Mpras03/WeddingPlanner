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

const sampleVendorProfile = {
  id: 1,
  user: {
    id: 3,
    email: 'vendor@kencana-wo.com',
    fullname: 'John Doe',
  },
  businessName: 'Kencana Wedding Organizer',
  ownerName: 'John Doe',
  businessEmail: 'business@kencana-wo.com',
  businessPhone: '081234567890',
  businessAddress: 'Jl. Sudirman No. 45',
  city: 'Jakarta',
  province: 'DKI Jakarta',
  latitude: -6.2088,
  longitude: 106.8456,
  description: 'Vendor spesialis dekorasi dan katering pernikahan',
  serviceArea: 'Jabodetabek',
  logoUrl: 'https://cdn.example.com/logo/kencana-wo.jpg',
  status: 1,
  rejectReason: null,
  isVerified: false,
  active: true,
  createdBy: null,
  createdAt: '2026-08-01T08:00:00.000Z',
  updatedBy: null,
  updatedAt: null,
};

export function ApiGetAllVendorProfile() {
  return applyDecorators(
    ApiOperation({ summary: 'Get All Vendor Profile' }),
    ApiQuery({
      name: 'filter',
      required: false,
      type: String,
      description: 'Filter berdasarkan businessName, ownerName, city, atau province',
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
      description: 'Berhasil mengambil semua data vendor profile dengan pagination',
      schema: {
        example: {
          statusCode: 200,
          message: 'Success Get All Vendor Profile',
          data: {
            data: [sampleVendorProfile],
            total: 1,
            pageNumber: 1,
            pageSize: 10,
          },
        },
      },
    }),
  );
}

export function ApiGetVendorProfileById() {
  return applyDecorators(
    ApiOperation({ summary: 'Get Vendor Profile By Id' }),
    ApiOkResponse({
      description: 'Berhasil mengambil data vendor profile berdasarkan id',
      schema: {
        example: {
          statusCode: 200,
          message: 'Success Get Vendor Profile By Id',
          data: sampleVendorProfile,
        },
      },
    }),
    ApiNotFoundResponse({
      description: 'Vendor profile tidak ditemukan',
      schema: {
        example: {
          statusCode: 404,
          message: 'Vendor profile not found',
          error: 'Not Found',
        },
      },
    }),
  );
}

export function ApiCreateVendorProfile() {
  return applyDecorators(
    ApiOperation({ summary: 'Create Vendor Profile' }),
    ApiCreatedResponse({
      description: 'Berhasil membuat vendor profile baru',
      schema: {
        example: {
          statusCode: 201,
          message: 'Success Create Vendor Profile',
          data: sampleVendorProfile,
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
      description: 'User sudah memiliki vendor profile',
      schema: {
        example: {
          statusCode: 409,
          message: 'User already has a vendor profile',
          error: 'Conflict',
        },
      },
    }),
  );
}

export function ApiUpdateVendorProfile() {
  return applyDecorators(
    ApiOperation({ summary: 'Update Vendor Profile' }),
    ApiOkResponse({
      description: 'Berhasil mengupdate vendor profile',
      schema: {
        example: {
          statusCode: 200,
          message: 'Success Update Vendor Profile',
          data: {
            ...sampleVendorProfile,
            status: 2,
            isVerified: true,
            updatedAt: '2026-08-01T11:00:00.000Z',
          },
        },
      },
    }),
    ApiNotFoundResponse({
      description: 'Vendor profile tidak ditemukan',
      schema: {
        example: {
          statusCode: 404,
          message: 'Vendor profile not found',
          error: 'Not Found',
        },
      },
    }),
  );
}

export function ApiDeleteVendorProfile() {
  return applyDecorators(
    ApiOperation({ summary: 'Delete Vendor Profile' }),
    ApiNoContentResponse({ description: 'Berhasil menghapus vendor profile' }),
    ApiNotFoundResponse({
      description: 'Vendor profile tidak ditemukan',
      schema: {
        example: {
          statusCode: 404,
          message: 'Vendor profile not found',
          error: 'Not Found',
        },
      },
    }),
  );
}