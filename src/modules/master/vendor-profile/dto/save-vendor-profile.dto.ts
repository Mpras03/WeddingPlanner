import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';

// Body dikirim sebagai multipart/form-data (karena ada file upload), jadi field
// array/object dikirim sebagai JSON string oleh frontend lalu di-parse di sini
// sebelum divalidasi sebagai nested DTO.
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

class VendorContactItemDto {
  @ApiProperty({ example: 'WhatsApp' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  contactType: string;

  @ApiProperty({ example: '6281234567890' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  contactValue: string;
}

class VendorBankAccountItemDto {
  @ApiProperty({ example: 'BCA' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  bankName: string;

  @ApiProperty({ example: '1234567890' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  accountNumber: string;

  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  accountHolderName: string;
}

class VendorVerificationDocumentItemDto {
  @ApiProperty({ example: 'NIB' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  documentType: string;

  @ApiPropertyOptional({ example: '1234567890123' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  documentNumber?: string;
}

export class SaveVendorProfileDto {
  @ApiProperty({
    description: 'Id user pemilik vendor profile ini',
    example: 1,
  })
  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  userId: number;

  @ApiPropertyOptional({ example: 'Kencana Wedding Organizer' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  businessName?: string;

  @ApiPropertyOptional({ example: 'John Doe' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  ownerName?: string;

  @ApiPropertyOptional({ example: 'business@kencana-wo.com' })
  @IsOptional()
  @IsEmail()
  @MaxLength(100)
  businessEmail?: string;

  @ApiPropertyOptional({ example: '081234567890' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  businessPhone?: string;

  @ApiPropertyOptional({ example: 'Jl. Sudirman No. 45' })
  @IsOptional()
  @IsString()
  businessAddress?: string;

  @ApiPropertyOptional({ example: 'Jakarta' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;

  @ApiPropertyOptional({ example: 'DKI Jakarta' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  province?: string;

  @ApiPropertyOptional({ example: -6.2088 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional({ example: 106.8456 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  longitude?: number;

  @ApiPropertyOptional({
    example: 'Vendor spesialis dekorasi dan katering pernikahan',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'Jabodetabek' })
  @IsOptional()
  @IsString()
  serviceArea?: string;

  @ApiPropertyOptional({
    description: 'URL logo bisnis (kolom logoUrl yang sudah ada sejak awal)',
    example: 'https://cdn.example.com/logo/kencana-wo.jpg',
  })
  @IsOptional()
  @IsString()
  logoUrl?: string;

  @ApiPropertyOptional({
    description:
      'Kategori vendor yang dipilih, disimpan sebagai comma-separated string',
    example: ['Catering', 'Wedding Organizer', 'Decoration'],
    type: [String],
  })
  @IsOptional()
  @Transform(parseIfJsonString)
  @IsArray()
  @IsString({ each: true })
  categories?: string[];

  @ApiPropertyOptional({
    description:
      'Daftar kontak bisnis (dikirim sebagai JSON string di form-data)',
    type: [VendorContactItemDto],
  })
  @IsOptional()
  @Transform(parseIfJsonString)
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VendorContactItemDto)
  contacts?: VendorContactItemDto[];

  @ApiPropertyOptional({
    description:
      'Rekening pencairan utama (API saat ini hanya mendukung satu rekening utama)',
    type: VendorBankAccountItemDto,
  })
  @IsOptional()
  @Transform(parseIfJsonString)
  @ValidateNested()
  @Type(() => VendorBankAccountItemDto)
  bankAccount?: VendorBankAccountItemDto;

  @ApiPropertyOptional({
    description:
      'Daftar dokumen verifikasi yang dikirim (dikirim sebagai JSON string di form-data)',
    type: [VendorVerificationDocumentItemDto],
  })
  @IsOptional()
  @Transform(parseIfJsonString)
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VendorVerificationDocumentItemDto)
  @ArrayMaxSize(20)
  verificationDocuments?: VendorVerificationDocumentItemDto[];
}
