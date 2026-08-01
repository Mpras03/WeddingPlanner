import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateCustomerProfileDto {

  @ApiProperty({
    description: 'Id user pemilik profile ini',
    example: 1,
  })
  @IsInt()
  @IsNotEmpty()
  userId: number;

  @ApiProperty({
    example: 'John Doe',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  fullName: string;

  @ApiPropertyOptional({
    description: 'Kode gender, contoh: 1 = Laki-laki, 2 = Perempuan',
    example: 1,
  })
  @IsOptional()
  @IsInt()
  gender?: number;

  @ApiPropertyOptional({
    example: '1995-08-17',
  })
  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @ApiPropertyOptional({
    example: 'https://cdn.example.com/avatar/johndoe.jpg',
  })
  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @ApiPropertyOptional({
    example: 'Jl. Merdeka No. 10',
  })
  @IsOptional()
  @IsString()
  address?: string;

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
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @ApiPropertyOptional({
    description: 'Kode status profile',
    example: 1,
  })
  @IsOptional()
  @IsInt()
  status?: number;

}