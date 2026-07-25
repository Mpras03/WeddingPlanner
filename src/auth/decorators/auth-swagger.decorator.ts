import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiBody,
  ApiOkResponse,
  ApiUnauthorizedResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { LoginDto } from '../dto/login.dto';

export function ApiLogin() {
  return applyDecorators(
    ApiOperation({ summary: 'Login' }),
    ApiBody({
      type: LoginDto,
      examples: {
        example1: {
          summary: 'Contoh request login',
          value: { username: 'johndoe', password: 'MySecretPassword123' },
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
            access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsInVzZXJuYW1lIjoiam9obmRvZSJ9.abc123signature',
            user: {
              id: 1,
              username: 'johndoe',
              name: 'John Doe',
            },
          },
        },
      },
    }),
    ApiUnauthorizedResponse({ description: 'Username atau password salah' }),
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
            username: 'johndoe',
            name: 'John Doe',
            roles: [
              { id: 1, roleName: 'Admin' },
            ],
          },
        },
      },
    }),
    ApiUnauthorizedResponse({ description: 'Token tidak valid atau tidak ada' }),
  );
}