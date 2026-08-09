import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateAttachmentDto {
  @ApiProperty({
    example: 'vendor_profile',
    description:
      'Nama tabel referensi pemilik attachment (mis. vendor_profile, customer_profile, product)',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'referenceTable hanya boleh berisi huruf, angka, dan underscore',
  })
  referenceTable: string;

  @ApiProperty({ example: 1, description: 'Id baris pada tabel referensi' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  referenceId: number;

  @ApiPropertyOptional({
    example: 'profile_photo',
    description: 'Kategori attachment',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  category?: string;

  @ApiPropertyOptional({ example: 'Foto profil vendor' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({ example: 0, default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  sortOrder?: number = 0;
}
