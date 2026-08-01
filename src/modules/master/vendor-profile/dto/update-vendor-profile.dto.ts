import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class UpdateVendorProfileDto {

  @ApiPropertyOptional({
    example: 'Kencana Wedding Organizer',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  businessName?: string;

  @ApiPropertyOptional({
    example: 'John Doe',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  ownerName?: string;

  @ApiPropertyOptional({
    example: 'business@kencana-wo.com',
  })
  @IsOptional()
  @IsEmail()
  @MaxLength(100)
  businessEmail?: string;

  @ApiPropertyOptional({
    example: '081234567890',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  businessPhone?: string;

  @ApiPropertyOptional({
    example: 'Jl. Sudirman No. 45',
  })
  @IsOptional()
  @IsString()
  businessAddress?: string;

  @ApiPropertyOptional({
    example: 'Jakarta',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;

  @ApiPropertyOptional({
    example: 'DKI Jakarta',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  province?: string;

  @ApiPropertyOptional({
    example: -6.2088,
  })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional({
    example: 106.8456,
  })
  @IsOptional()
  @IsNumber()
  longitude?: number;

  @ApiPropertyOptional({
    example: 'Vendor spesialis dekorasi dan katering pernikahan',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    example: 'Jabodetabek',
  })
  @IsOptional()
  @IsString()
  serviceArea?: string;

  @ApiPropertyOptional({
    example: 'https://cdn.example.com/logo/kencana-wo.jpg',
  })
  @IsOptional()
  @IsString()
  logoUrl?: string;

  @ApiPropertyOptional({
    description: 'Kode status vendor',
    example: 2,
  })
  @IsOptional()
  @IsInt()
  status?: number;

  @ApiPropertyOptional({
    description: 'Alasan penolakan vendor, biasanya diisi bersamaan dengan status ditolak',
    example: 'Dokumen legalitas belum lengkap',
  })
  @IsOptional()
  @IsString()
  rejectReason?: string;

  @ApiPropertyOptional({
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isVerified?: boolean;

  @ApiPropertyOptional({
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  active?: boolean;

}