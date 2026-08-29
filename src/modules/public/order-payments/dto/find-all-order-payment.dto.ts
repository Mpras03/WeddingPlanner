import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, Min } from 'class-validator';
import { OrderPaymentStatus } from '../order-payment.enum';

export class FindAllOrderPaymentDto {
  @ApiPropertyOptional({
    description: 'Filter berdasarkan id order pemilik pembayaran ini',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  orderId?: number;

  @ApiPropertyOptional({
    description: 'Filter berdasarkan status pembayaran',
    enum: OrderPaymentStatus,
    example: OrderPaymentStatus.WAITING_VERIFICATION,
  })
  @IsOptional()
  @IsIn(Object.values(OrderPaymentStatus))
  status?: OrderPaymentStatus;

  @ApiPropertyOptional({
    description: 'Halaman yang ingin ditampilkan (dimulai dari 1)',
    example: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pageNumber?: number = 1;

  @ApiPropertyOptional({
    description: 'Jumlah data per halaman',
    example: 10,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pageSize?: number = 10;
}
