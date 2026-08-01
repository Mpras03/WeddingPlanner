import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class DecryptDataDto {
  @ApiProperty({
    description: 'Data terenkripsi (base64) yang akan didekripsi',
    example: 'gk2mQY3f8h1sJd0aB9xLZQ==:8sM3nQpV1cKzT7hD2wRfXg==',
  })
  @IsNotEmpty()
  @IsString()
  cipherText: string;
}