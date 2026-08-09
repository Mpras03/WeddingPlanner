import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { ParameterDetailItemDto } from './parameter-detail-item.dto';

export class CreateParameterDto {
  @ApiProperty({
    example: 'GENDER',
    description: 'Kode unik header parameter',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  code: string;

  @ApiPropertyOptional({
    example: 'Parameter jenis kelamin',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  active?: boolean = true;

  @ApiPropertyOptional({
    type: [ParameterDetailItemDto],
    description: 'Daftar detail parameter',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ParameterDetailItemDto)
  details?: ParameterDetailItemDto[];
}
