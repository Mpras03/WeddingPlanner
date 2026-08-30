import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CancelOrderDto {
  @ApiPropertyOptional({
    description: 'Alasan pembatalan (opsional)',
    example: 'Berubah rencana, tidak jadi menggunakan vendor ini',
  })
  @IsOptional()
  @IsString()
  reason?: string;
}
