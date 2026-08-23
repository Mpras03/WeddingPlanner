import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { VendorProductStatus } from '../vendor-product-status.enum';

export class FindAllVendorProductDto {
  @ApiPropertyOptional({
    description:
      'Filter berdasarkan name atau category (partial match, case-insensitive)',
    example: '',
  })
  @IsOptional()
  @IsString()
  filter?: string;

  @ApiPropertyOptional({
    description: 'Filter berdasarkan id vendor profile pemilik produk',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  vendorId?: number;

  @ApiPropertyOptional({
    description: 'Filter berdasarkan status produk',
    enum: VendorProductStatus,
    example: VendorProductStatus.ACTIVE,
  })
  @IsOptional()
  @IsIn(Object.values(VendorProductStatus))
  status?: VendorProductStatus;

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
