import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class EncryptDataDto {
  @ApiProperty({
    description: 'Data plain text yang akan dienkripsi',
    example: 'MySecretPassword123',
  })
  @IsNotEmpty()
  @IsString()
  plainText: string;
}