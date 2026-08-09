import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateVerificationDocumentDto {
  @ApiProperty({
    description: 'Jenis dokumen legal, mis. NIB, KTP, NPWP',
    example: 'NIB',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  documentType: string;

  @ApiPropertyOptional({
    example: '1234567890123',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  documentNumber?: string;
}
