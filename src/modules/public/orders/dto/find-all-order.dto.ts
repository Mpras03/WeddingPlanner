import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { OrderStatus } from '../order-status.enum';

export class FindAllOrderDto {
  @ApiPropertyOptional({
    description: 'Filter berdasarkan orderNumber (partial match, case-insensitive)',
    example: '',
  })
  @IsOptional()
  @IsString()
  filter?: string;

  @ApiPropertyOptional({
    description: 'Filter berdasarkan id customer profile pemilik order (untuk "Pesanan Saya")',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  customerId?: number;

  @ApiPropertyOptional({
    description: 'Filter berdasarkan id vendor profile penerima order (untuk pesanan masuk vendor)',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  vendorId?: number;

  @ApiPropertyOptional({
    description: 'Filter berdasarkan status order',
    enum: OrderStatus,
    example: OrderStatus.WAITING_VENDOR_CONFIRMATION,
  })
  @IsOptional()
  @IsIn(Object.values(OrderStatus))
  status?: OrderStatus;

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
