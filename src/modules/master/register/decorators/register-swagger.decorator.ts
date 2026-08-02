import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiBody,
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiConflictResponse,
} from '@nestjs/swagger';
import { RegisterCustomerDto } from '../dto/register-customer.dto';
import { RegisterVendorDto } from '../dto/register-vendor.dto';

export function ApiRegisterCustomer() {
  return applyDecorators(
    ApiOperation({
      summary: 'Register sebagai Customer',
      description: 'Field "password" dan "confirmPassword" harus dikirim dalam bentuk cipherText hasil dari POST /cryptography/encrypt',
    }),
    ApiBody({
      type: RegisterCustomerDto,
      examples: {
        example1: {
          summary: 'Contoh request register customer',
          value: {
            fullname: 'Jane Doe',
            email: 'jane@example.com',
            phoneNumber: '081234567890',
            password: 'gk2mQY3f8h1sJd0aB9xLZQ==:8sM3nQpV1cKzT7hD2wRfXg==',
            confirmPassword: 'gk2mQY3f8h1sJd0aB9xLZQ==:8sM3nQpV1cKzT7hD2wRfXg==',
          },
        },
      },
    }),
    ApiCreatedResponse({
      description: 'Berhasil register sebagai customer',
      schema: {
        example: {
          statusCode: 201,
          message: 'Success Register Customer',
          data: {
            user: {
              id: 5,
              fullname: 'Jane Doe',
              email: 'jane@example.com',
            },
            profile: {
              id: 3,
              fullName: 'Jane Doe',
              active: true,
              createdAt: '2026-08-02T08:00:00.000Z',
            },
          },
        },
      },
    }),
    ApiBadRequestResponse({
      description: 'Validasi gagal: format email salah, password lemah, atau password tidak sama dengan konfirmasi',
      schema: {
        example: {
          statusCode: 400,
          message: 'Password minimal 8 karakter dan harus mengandung minimal 1 huruf besar, 1 angka, dan 1 simbol',
          error: 'Bad Request',
        },
      },
    }),
    ApiConflictResponse({
      description: 'Email atau nomor HP sudah terdaftar',
      schema: {
        example: {
          statusCode: 409,
          message: 'Email sudah terdaftar',
          error: 'Conflict',
        },
      },
    }),
  );
}

export function ApiRegisterVendor() {
  return applyDecorators(
    ApiOperation({
      summary: 'Register sebagai Vendor',
      description: 'Field "password" dan "confirmPassword" harus dikirim dalam bentuk cipherText hasil dari POST /cryptography/encrypt',
    }),
    ApiBody({
      type: RegisterVendorDto,
      examples: {
        example1: {
          summary: 'Contoh request register vendor',
          value: {
            ownerName: 'John Doe',
            businessName: 'Kencana Wedding Organizer',
            email: 'vendor@example.com',
            businessPhone: '081234567890',
            businessAddress: 'Jl. Sudirman No. 45, Jakarta',
            password: 'gk2mQY3f8h1sJd0aB9xLZQ==:8sM3nQpV1cKzT7hD2wRfXg==',
            confirmPassword: 'gk2mQY3f8h1sJd0aB9xLZQ==:8sM3nQpV1cKzT7hD2wRfXg==',
          },
        },
      },
    }),
    ApiCreatedResponse({
      description: 'Berhasil register sebagai vendor',
      schema: {
        example: {
          statusCode: 201,
          message: 'Success Register Vendor',
          data: {
            user: {
              id: 6,
              fullname: 'John Doe',
              email: 'vendor@example.com',
            },
            profile: {
              id: 2,
              businessName: 'Kencana Wedding Organizer',
              ownerName: 'John Doe',
              businessEmail: 'vendor@example.com',
              businessPhone: '081234567890',
              businessAddress: 'Jl. Sudirman No. 45, Jakarta',
              isVerified: false,
              active: true,
              createdAt: '2026-08-02T08:00:00.000Z',
            },
          },
        },
      },
    }),
    ApiBadRequestResponse({
      description: 'Validasi gagal: format email salah, password lemah, atau password tidak sama dengan konfirmasi',
      schema: {
        example: {
          statusCode: 400,
          message: 'Password minimal 8 karakter dan harus mengandung minimal 1 huruf besar, 1 angka, dan 1 simbol',
          error: 'Bad Request',
        },
      },
    }),
    ApiConflictResponse({
      description: 'Email atau nomor HP sudah terdaftar',
      schema: {
        example: {
          statusCode: 409,
          message: 'Nomor HP sudah terdaftar',
          error: 'Conflict',
        },
      },
    }),
  );
}