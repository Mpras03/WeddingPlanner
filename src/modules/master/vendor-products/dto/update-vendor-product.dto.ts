import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { VendorProductStatus } from '../vendor-product-status.enum';

// Body dikirim sebagai multipart/form-data (karena ada file upload gambar produk), jadi field
// boolean dikirim sebagai string oleh frontend lalu di-parse di sini sebelum divalidasi.
function parseIfJsonString({ value }: { value: unknown }): unknown {
  if (typeof value !== 'string') {
    return value;
  }
  try {
    return JSON.parse(value) as unknown;
  } catch {
    return value;
  }
}

export class UpdateVendorProductDto {
  @ApiPropertyOptional({ example: 'Catering' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  category?: string;

  @ApiPropertyOptional({ example: 'Paket Catering Premium 500 Pax' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  name?: string;

  @ApiPropertyOptional({
    example: 'Paket catering lengkap dengan live cooking station',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 250000000 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  price?: number;

  @ApiPropertyOptional({ example: 50000000 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  minimumDp?: number;

  @ApiPropertyOptional({ example: '8 jam' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  duration?: string;

  @ApiPropertyOptional({ example: 500 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  guestCapacity?: number;

  @ApiPropertyOptional({ example: 'Jabodetabek' })
  @IsOptional()
  @IsString()
  serviceArea?: string;

  @ApiPropertyOptional({
    example: 'Pembayaran DP 50% saat booking, pelunasan H-7 sebelum acara',
  })
  @IsOptional()
  @IsString()
  terms?: string;

  @ApiPropertyOptional({
    enum: VendorProductStatus,
    example: VendorProductStatus.ACTIVE,
  })
  @IsOptional()
  @IsIn(Object.values(VendorProductStatus))
  status?: VendorProductStatus;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @Transform(parseIfJsonString)
  @IsBoolean()
  active?: boolean;
}
