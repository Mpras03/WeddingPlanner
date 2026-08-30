import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';
import { OrderStatus } from '../order-status.enum';

const RESOLVABLE_STATUSES = [OrderStatus.COMPLETED, OrderStatus.CANCELLED];

export class ResolveDisputeOrderDto {
  @ApiProperty({
    description: 'Status akhir penyelesaian sengketa',
    enum: RESOLVABLE_STATUSES,
    example: OrderStatus.COMPLETED,
  })
  @IsIn(RESOLVABLE_STATUSES)
  status: OrderStatus.COMPLETED | OrderStatus.CANCELLED;

  @ApiPropertyOptional({
    description: 'Catatan penyelesaian sengketa (opsional)',
    example: 'Vendor sudah menyelesaikan kewajiban sesuai kesepakatan, sengketa ditutup',
  })
  @IsOptional()
  @IsString()
  note?: string;
}
