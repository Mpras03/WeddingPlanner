import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class FindAllParameterDto {
  @ApiPropertyOptional({
    example: 'gender',
    description: 'Filter pencarian berdasarkan kode header parameter',
  })
  @IsOptional()
  @IsString()
  filter?: string;

  @ApiPropertyOptional({
    example: 1,
    description: 'Halaman yang ingin ditampilkan',
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pageNumber?: number = 1;

  @ApiPropertyOptional({
    example: 10,
    description: 'Jumlah data per halaman',
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pageSize?: number = 10;
}
