import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateVerificationDocumentDto {
  @ApiPropertyOptional({
    example: 'NIB',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  documentType?: string;

  @ApiPropertyOptional({
    example: '1234567890123',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  documentNumber?: string;

  @ApiPropertyOptional({
    description:
      'Kode status global (lihat Status enum): 1=Draft, 2=Pending Verification, 3=Verified, 4=Rejected, 5=Suspended, 6=Inactive',
    example: 3,
  })
  @IsOptional()
  @IsInt()
  status?: number;

  @ApiPropertyOptional({
    description: 'Alasan penolakan, diisi bersamaan dengan status ditolak',
    example: 'Dokumen tidak terbaca',
  })
  @IsOptional()
  @IsString()
  rejectReason?: string;
}
