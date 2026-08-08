import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiBody,
  ApiOkResponse,
  ApiUnauthorizedResponse,
  ApiBadRequestResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { LoginDto } from '../dto/login.dto';
import { VerifyOtpDto } from '../dto/verify-otp.dto';
import { ResendOtpDto } from '../dto/resend-otp.dto';
import { ForgotPasswordDto } from '../dto/forgot-password.dto';
import { ChangePasswordDto } from '../dto/change-password.dto';
import { OtpPurpose } from '../otp/otp-purpose.enum';

export function ApiLogin() {
  return applyDecorators(
    ApiOperation({
      summary: 'Login',
      description: 'Field "password" harus dikirim dalam bentuk cipherText hasil dari POST /cryptography/encrypt',
    }),
    ApiBody({
      type: LoginDto,
      examples: {
        example1: {
          summary: 'Contoh request login',
          value: {
            email: 'johndoe@example.com',
            password: 'gk2mQY3f8h1sJd0aB9xLZQ==:8sM3nQpV1cKzT7hD2wRfXg==',
          },
        },
      },
    }),
    ApiOkResponse({
      description: 'Berhasil login',
      schema: {
        example: {
          statusCode: 200,
          message: 'Success Login',
          data: {
            access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsImVtYWlsIjoiam9obmRvZUBleGFtcGxlLmNvbSJ9.abc123signature',
            user: {
              id: 1,
              email: 'johndoe@example.com',
              fullname: 'John Doe',
              phoneNumber: '081234567890',
              isEmailVerified: true,
              isPhoneVerified: false,
            },
            roles: {
              id: 1,
              roleName: 'Admin',
            },
            listRoles: [
              { id: 1, roleName: 'Admin' },
              { id: 2, roleName: 'Staff' },
            ],
          },
        },
      },
    }),
    ApiUnauthorizedResponse({
      description: 'Email atau password salah',
      schema: {
        example: {
          statusCode: 401,
          message: 'Email atau password salah',
          error: 'Unauthorized',
        },
      },
    }),
  );
}

export function ApiLogout() {
  return applyDecorators(
    ApiOperation({ summary: 'Logout' }),
    ApiOkResponse({
      description: 'Berhasil logout',
      schema: {
        example: {
          statusCode: 200,
          message: 'Success Logout',
          data: null,
        },
      },
    }),
  );
}

export function ApiVerifyOtp() {
  return applyDecorators(
    ApiOperation({
      summary: 'Verify OTP',
      description: 'Verifikasi kode OTP yang dikirim ke email user, sesuai dengan purpose tertentu (mis. register, forgot_password).',
    }),
    ApiBody({
      type: VerifyOtpDto,
      examples: {
        example1: {
          summary: 'Contoh request verify OTP',
          value: {
            email: 'johndoe@example.com',
            otpCode: '123456',
            purpose: OtpPurpose.REGISTER,
          },
        },
      },
    }),
    ApiOkResponse({
      description: 'Berhasil verifikasi OTP',
      schema: {
        example: {
          statusCode: 200,
          message: 'Success Verify OTP',
          data: {
            email: 'johndoe@example.com',
            purpose: OtpPurpose.REGISTER,
            verified: true,
          },
        },
      },
    }),
    ApiBadRequestResponse({
      description: 'Kode OTP salah, kedaluwarsa, sudah digunakan, atau terlalu banyak percobaan',
      schema: {
        example: {
          statusCode: 400,
          message: 'Kode OTP salah',
          error: 'Bad Request',
        },
      },
    }),
  );
}

export function ApiResendOtp() {
  return applyDecorators(
    ApiOperation({
      summary: 'Resend OTP',
      description: 'Mengirim ulang kode OTP baru ke email user untuk purpose tertentu. OTP aktif sebelumnya (jika ada) otomatis dinonaktifkan sebelum kode baru dikirim.',
    }),
    ApiBody({
      type: ResendOtpDto,
      examples: {
        example1: {
          summary: 'Contoh request resend OTP',
          value: {
            email: 'johndoe@example.com',
            purpose: OtpPurpose.REGISTER,
          },
        },
      },
    }),
    ApiOkResponse({
      description: 'Berhasil mengirim ulang OTP',
      schema: {
        example: {
          statusCode: 200,
          message: 'Success Resend OTP',
          data: {
            email: 'johndoe@example.com',
            purpose: OtpPurpose.REGISTER,
            sent: true,
          },
        },
      },
    }),
    ApiBadRequestResponse({
      description: 'Email tidak ditemukan',
      schema: {
        example: {
          statusCode: 400,
          message: 'Email tidak ditemukan',
          error: 'Bad Request',
        },
      },
    }),
  );
}

export function ApiForgotPassword() {
  return applyDecorators(
    ApiOperation({
      summary: 'Forgot Password',
      description: 'Mengirim kode OTP purpose forgot_password ke email user. Menggunakan mekanisme yang sama seperti resend OTP, OTP aktif sebelumnya (jika ada) otomatis dinonaktifkan sebelum kode baru dikirim.',
    }),
    ApiBody({
      type: ForgotPasswordDto,
      examples: {
        example1: {
          summary: 'Contoh request forgot password',
          value: {
            email: 'johndoe@example.com',
          },
        },
      },
    }),
    ApiOkResponse({
      description: 'Berhasil mengirim OTP forgot password',
      schema: {
        example: {
          statusCode: 200,
          message: 'Success Forgot Password',
          data: {
            email: 'johndoe@example.com',
            purpose: OtpPurpose.FORGOT_PASSWORD,
            sent: true,
          },
        },
      },
    }),
    ApiBadRequestResponse({
      description: 'Email tidak ditemukan',
      schema: {
        example: {
          statusCode: 400,
          message: 'Email tidak ditemukan',
          error: 'Bad Request',
        },
      },
    }),
  );
}

export function ApiChangePassword() {
  return applyDecorators(
    ApiOperation({
      summary: 'Change Password',
      description: 'Mengubah password user setelah OTP forgot_password berhasil diverifikasi lewat POST /auth/verify-otp. Field password harus dikirim dalam bentuk cipherText hasil dari POST /cryptography/encrypt.',
    }),
    ApiBody({
      type: ChangePasswordDto,
      examples: {
        example1: {
          summary: 'Contoh request change password',
          value: {
            email: 'johndoe@example.com',
            newPassword: 'gk2mQY3f8h1sJd0aB9xLZQ==:8sM3nQpV1cKzT7hD2wRfXg==',
            confirmNewPassword: 'gk2mQY3f8h1sJd0aB9xLZQ==:8sM3nQpV1cKzT7hD2wRfXg==',
          },
        },
      },
    }),
    ApiOkResponse({
      description: 'Berhasil mengubah password',
      schema: {
        example: {
          statusCode: 200,
          message: 'Success Change Password',
          data: {
            email: 'johndoe@example.com',
            changed: true,
          },
        },
      },
    }),
    ApiBadRequestResponse({
      description: 'Belum ada verifikasi OTP forgot_password yang valid, atau password tidak sama/tidak kuat',
      schema: {
        example: {
          statusCode: 400,
          message: 'Verifikasi OTP forgot password diperlukan dan belum kedaluwarsa sebelum mengubah password',
          error: 'Bad Request',
        },
      },
    }),
  );
}

export function ApiProfile() {
  return applyDecorators(
    ApiBearerAuth('JWT'),
    ApiOperation({ summary: 'Get Profile' }),
    ApiOkResponse({
      description: 'Berhasil mengambil data profile user yang sedang login',
      schema: {
        example: {
          statusCode: 200,
          message: 'Success Get Profile',
          data: {
            id: 1,
            email: 'johndoe@example.com',
            fullname: 'John Doe',
            roles: {
              id: 1,
              roleName: 'Admin',
            },
            listRoles: [
              { id: 1, roleName: 'Admin' },
              { id: 2, roleName: 'Staff' },
            ],
          },
        },
      },
    }),
    ApiUnauthorizedResponse({
      description: 'Token tidak valid atau tidak ada',
      schema: {
        example: {
          statusCode: 401,
          message: 'Unauthorized',
          error: 'Unauthorized',
        },
      },
    }),
  );
}