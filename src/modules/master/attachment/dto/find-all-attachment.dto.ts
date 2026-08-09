import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class FindAllAttachmentDto {
  @ApiPropertyOptional({
    example: 'vendor_profile',
    description: 'Filter berdasarkan tabel referensi',
  })
  @IsOptional()
  @IsString()
  referenceTable?: string;

  @ApiPropertyOptional({
    example: 1,
    description: 'Filter berdasarkan id baris referensi',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  referenceId?: number;

  @ApiPropertyOptional({
    example: 'profile_photo',
    description: 'Filter berdasarkan kategori',
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({
    example: 1,
    description: 'Halaman yang ingin ditampilkan',
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pageNumber?: number = 1;

  @ApiPropertyOptional({
    example: 10,
    description: 'Jumlah data per halaman',
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pageSize?: number = 10;
}
