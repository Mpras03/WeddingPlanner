import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class FindAllVendorProductReviewDto {
  @ApiPropertyOptional({
    description: 'Filter berdasarkan id vendor product yang diulas (untuk tampilan detail produk)',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  vendorProductId?: number;

  @ApiPropertyOptional({
    description: 'Filter berdasarkan id vendor profile pemilik produk',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  vendorId?: number;

  @ApiPropertyOptional({
    description: 'Filter berdasarkan id customer profile penulis ulasan',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  customerId?: number;

  @ApiPropertyOptional({ description: 'Filter berdasarkan rating persis (1-5)', example: 5 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  rating?: number;

  @ApiPropertyOptional({
    description: 'Halaman yang ingin ditampilkan (dimulai dari 1)',
    example: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pageNumber?: number = 1;

  @ApiPropertyOptional({
    description: 'Jumlah data per halaman',
    example: 10,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pageSize?: number = 10;
}
