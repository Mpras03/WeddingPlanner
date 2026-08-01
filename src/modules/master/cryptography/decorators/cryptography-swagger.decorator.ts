import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiBody, ApiOkResponse, ApiBadRequestResponse } from '@nestjs/swagger';
import { EncryptDataDto } from '../dto/encrypt-data.dto';
import { DecryptDataDto } from '../dto/decrypt-data.dto';

export function ApiEncryptData() {
  return applyDecorators(
    ApiOperation({ summary: 'Encrypt Data' }),
    ApiBody({
      type: EncryptDataDto,
      examples: {
        example1: {
          summary: 'Contoh request encrypt',
          value: { plainText: 'MySecretPassword123' },
        },
      },
    }),
    ApiOkResponse({
      description: 'Data berhasil dienkripsi',
      schema: {
        example: {
          statusCode: 200,
          message: 'Success Encrypt Data',
          data: { cipherText: 'gk2mQY3f8h1sJd0aB9xLZQ==:8sM3nQpV1cKzT7hD2wRfXg==' },
        },
      },
    }),
    ApiBadRequestResponse({ description: 'Input tidak valid' }),
  );
}

export function ApiDecryptData() {
  return applyDecorators(
    ApiOperation({ summary: 'Decrypt Data' }),
    ApiBody({
      type: DecryptDataDto,
      examples: {
        example1: {
          summary: 'Contoh request decrypt',
          value: { cipherText: 'gk2mQY3f8h1sJd0aB9xLZQ==:8sM3nQpV1cKzT7hD2wRfXg==' },
        },
      },
    }),
    ApiOkResponse({
      description: 'Data berhasil didekripsi',
      schema: {
        example: {
          statusCode: 200,
          message: 'Success Decrypt Data',
          data: { plainText: 'MySecretPassword123' },
        },
      },
    }),
    ApiBadRequestResponse({ description: 'Cipher text tidak valid atau corrupt' }),
  );
}