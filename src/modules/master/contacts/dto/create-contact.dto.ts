import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateContactDto {
  @ApiProperty({
    description: 'Jenis kontak, mis. WhatsApp, Instagram, Website',
    example: 'WhatsApp',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  contactType: string;

  @ApiProperty({
    description: 'Nilai/detail kontak',
    example: '6281234567890',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  contactValue: string;

  @ApiPropertyOptional({
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
