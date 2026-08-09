import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class ParameterDetailItemDto {
  @ApiPropertyOptional({
    example: '1',
    description:
      'Id parameter detail. Isi untuk mempertahankan/mengubah detail yang sudah ada, kosongkan untuk detail baru. Detail lama yang tidak disertakan pada saat update akan dihapus.',
  })
  @IsOptional()
  @IsString()
  id?: string;

  @ApiProperty({
    example: 'MALE',
    description: 'Kode detail parameter',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  code: string;

  @ApiPropertyOptional({
    example: 'Laki-laki',
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  description?: string;

  @ApiProperty({
    example: 1,
    description: 'Urutan tampil detail parameter',
  })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  ordering: number;

  @ApiPropertyOptional({
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  active?: boolean = true;
}
