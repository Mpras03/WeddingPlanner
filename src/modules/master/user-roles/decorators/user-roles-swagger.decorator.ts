import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiQuery,
  ApiBody,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiConflictResponse,
} from '@nestjs/swagger';
import { CreateUserRoleDto } from '../dto/create-user-role.dto';
import { UpdateUserRoleDto } from '../dto/update-user-role.dto';

export function ApiGetAllUserRoles() {
  return applyDecorators(
    ApiOperation({ summary: 'Get All User Roles' }),
    ApiQuery({
      name: 'filter',
      required: false,
      type: String,
      description: 'Filter berdasarkan fullname, email, atau nama role',
      example: 'admin',
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
      description: 'Berhasil mengambil semua data user role dengan pagination',
      schema: {
        example: {
          statusCode: 200,
          message: 'Success Get All User Roles',
          data: {
            data: [
              {
                id: 1,
                userId: 1,
                fullname: 'John Doe',
                email: 'johndoe@example.com',
                roleId: 1,
                roleName: 'Admin',
                isPrimary: true,
                description: 'Administrator System',
                createdAt: '2026-08-01T08:00:00.000Z',
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

export function ApiAssignRoleToUser() {
  return applyDecorators(
    ApiOperation({ summary: 'Assign Role To User' }),
    ApiBody({
      type: CreateUserRoleDto,
      examples: {
        example1: {
          summary: 'Contoh request assign role sebagai primary',
          value: { roleId: 1, isPrimary: true },
        },
      },
    }),
    ApiCreatedResponse({
      description: 'Berhasil assign role ke user',
      schema: {
        example: {
          statusCode: 201,
          message: 'Success Assign Role To User',
          data: {
            id: 1,
            userId: 1,
            fullname: 'John Doe',
            email: 'johndoe@example.com',
            roleId: 1,
            roleName: 'Admin',
            isPrimary: true,
            createdAt: '2026-08-01T10:00:00.000Z',
          },
        },
      },
    }),
    ApiNotFoundResponse({
      description: 'User atau Role tidak ditemukan',
      schema: {
        example: {
          statusCode: 404,
          message: 'User not found',
          error: 'Not Found',
        },
      },
    }),
    ApiConflictResponse({
      description: 'User sudah memiliki role tersebut',
      schema: {
        example: {
          statusCode: 409,
          message: 'User already has this role',
          error: 'Conflict',
        },
      },
    }),
  );
}

export function ApiGetUserRoles() {
  return applyDecorators(
    ApiOperation({ summary: 'Get User Roles' }),
    ApiOkResponse({
      description: 'Berhasil mengambil semua role milik satu user',
      schema: {
        example: {
          statusCode: 200,
          message: 'Success Get User Roles',
          data: {
            userId: 1,
            email: 'johndoe@example.com',
            fullname: 'John Doe',
            roles: [
              { id: 1, roleName: 'Admin', isPrimary: true },
              { id: 2, roleName: 'Staff', isPrimary: false },
            ],
          },
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

export function ApiUpdateUserRole() {
  return applyDecorators(
    ApiOperation({
      summary: 'Update User Role',
      description:
        'Update assignment role: bisa memindahkan ke user lain (userId), mengganti role (roleId), dan/atau mengubah isPrimary. Jika isPrimary di-set true, role primary lain milik user tersebut otomatis di-unset.',
    }),
    ApiBody({
      type: UpdateUserRoleDto,
      examples: {
        example1: {
          summary: 'Contoh request pindah user dan set primary',
          value: { userId: 2, isPrimary: true },
        },
        example2: {
          summary: 'Contoh request hanya update isPrimary',
          value: { isPrimary: false },
        },
      },
    }),
    ApiOkResponse({
      description: 'Berhasil mengupdate user role',
      schema: {
        example: {
          statusCode: 200,
          message: 'Success Update User Role',
          data: {
            id: 1,
            userId: 2,
            fullname: 'Jane Doe',
            email: 'janedoe@example.com',
            roleId: 1,
            roleName: 'Admin',
            isPrimary: true,
            updatedAt: '2026-08-01T11:00:00.000Z',
          },
        },
      },
    }),
    ApiNotFoundResponse({
      description: 'User role, User, atau Role tidak ditemukan',
      schema: {
        example: {
          statusCode: 404,
          message: 'User role not found',
          error: 'Not Found',
        },
      },
    }),
    ApiConflictResponse({
      description: 'User tujuan sudah memiliki role tersebut',
      schema: {
        example: {
          statusCode: 409,
          message: 'User already has this role',
          error: 'Conflict',
        },
      },
    }),
  );
}

export function ApiRemoveRoleFromUser() {
  return applyDecorators(
    ApiOperation({ summary: 'Remove Role From User' }),
    ApiNoContentResponse({ description: 'Berhasil menghapus role dari user' }),
    ApiNotFoundResponse({
      description: 'User role tidak ditemukan',
      schema: {
        example: {
          statusCode: 404,
          message: 'User role not found',
          error: 'Not Found',
        },
      },
    }),
  );
}