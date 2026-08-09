import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateContactDto {
  @ApiPropertyOptional({
    example: 'WhatsApp',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  contactType?: string;

  @ApiPropertyOptional({
    example: '6281234567890',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  contactValue?: string;

  @ApiPropertyOptional({
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
