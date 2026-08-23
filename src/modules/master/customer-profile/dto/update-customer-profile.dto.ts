import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

// Body dikirim sebagai multipart/form-data (karena ada file upload foto profil), jadi field
// array dikirim sebagai JSON string oleh frontend lalu di-parse di sini sebelum divalidasi.
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

const EVENT_TYPES = ['AKAD', 'RESEPSI', 'AKAD_DAN_RESEPSI', 'LAINNYA'];
const PACKAGE_PREFERENCES = ['FULL_SERVICE', 'PER_SERVICE', 'CUSTOM'];

export class UpdateCustomerProfileDto {
  @ApiPropertyOptional({ example: 'John Doe Updated' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  fullName?: string;

  @ApiPropertyOptional({
    description: 'Kode gender, contoh: 1 = Laki-laki, 2 = Perempuan',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  gender?: number;

  @ApiPropertyOptional({ example: '1995-08-17' })
  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @ApiPropertyOptional({ example: 'Jl. Merdeka No. 10' })
  @IsOptional()
  @IsString()
  address?: string;

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

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @Transform(parseIfJsonString)
  @IsBoolean()
  active?: boolean;

  @ApiPropertyOptional({ example: '2027-06-20' })
  @IsOptional()
  @IsDateString()
  weddingDate?: string;

  @ApiPropertyOptional({ example: 'AKAD_DAN_RESEPSI', enum: EVENT_TYPES })
  @IsOptional()
  @IsIn(EVENT_TYPES)
  eventType?: string;

  @ApiPropertyOptional({ example: 'DKI Jakarta' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  weddingProvince?: string;

  @ApiPropertyOptional({ example: 'Jakarta Selatan' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  weddingCity?: string;

  @ApiPropertyOptional({
    example: 'The Glass House, Jl. Gatot Subroto No. 10',
  })
  @IsOptional()
  @IsString()
  weddingLocation?: string;

  @ApiPropertyOptional({
    example: 'Modern romantic dengan nuansa putih dan dusty pink',
  })
  @IsOptional()
  @IsString()
  weddingTheme?: string;

  @ApiPropertyOptional({ example: 250 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  estimatedGuests?: number;

  @ApiPropertyOptional({ example: 'Jakarta dan sekitarnya' })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  preferredVendorLocation?: string;

  @ApiPropertyOptional({
    example: 'FULL_SERVICE',
    enum: PACKAGE_PREFERENCES,
  })
  @IsOptional()
  @IsIn(PACKAGE_PREFERENCES)
  packagePreference?: string;

  @ApiPropertyOptional({
    description:
      'Kategori vendor yang dibutuhkan, disimpan sebagai comma-separated string (dikirim sebagai JSON array string di form-data)',
    example: ['Catering', 'Photography'],
    type: [String],
  })
  @IsOptional()
  @Transform(parseIfJsonString)
  @IsArray()
  @IsString({ each: true })
  neededVendorCategories?: string[];

  @ApiPropertyOptional({ example: 250000000 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  estimatedBudget?: number;

  @ApiPropertyOptional({ example: 200000000 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  budgetRangeMin?: number;

  @ApiPropertyOptional({ example: 300000000 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  budgetRangeMax?: number;

  @ApiPropertyOptional({
    description:
      'Prioritas budget, disimpan sebagai comma-separated string (dikirim sebagai JSON array string di form-data)',
    example: ['Catering', 'Venue'],
    type: [String],
  })
  @IsOptional()
  @Transform(parseIfJsonString)
  @IsArray()
  @IsString({ each: true })
  budgetPriorities?: string[];

  @ApiPropertyOptional({
    description:
      'Hapus foto profil yang ada tanpa menggantinya dengan foto baru. Diabaikan kalau avatarPhoto turut dikirim (upload baru selalu menggantikan yang lama).',
    example: false,
  })
  @IsOptional()
  @Transform(parseIfJsonString)
  @IsBoolean()
  removeAvatarPhoto?: boolean;
}
