import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { OrderPaymentType } from '../order-status.enum';

// customerId sengaja tidak ada di DTO ini — pemilik order selalu diambil dari token JWT
// (lihat OrdersService.create), bukan dipercaya dari body, supaya customer tidak bisa membuat
// order atas nama customer lain.
export class CreateOrderDto {
  @ApiProperty({
    description: 'Id vendor product/paket yang dipesan',
    example: 1,
  })
  @IsInt()
  @IsNotEmpty()
  vendorProductId: number;

  @ApiProperty({ description: 'Tanggal acara', example: '2027-06-20' })
  @IsDateString()
  eventDate: string;

  @ApiProperty({
    description: 'Lokasi acara',
    example: 'The Glass House, Jl. Gatot Subroto No. 10, Jakarta Selatan',
  })
  @IsString()
  @IsNotEmpty()
  eventLocation: string;

  @ApiPropertyOptional({ description: 'Jumlah tamu', example: 250 })
  @IsOptional()
  @IsInt()
  @Min(1)
  guestCount?: number;

  @ApiPropertyOptional({
    description: 'Catatan tambahan untuk vendor',
    example: 'Mohon konfirmasi ketersediaan tanggal sebelum H-30',
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({
    description:
      'Jenis pembayaran yang dipilih customer saat checkout — DP kalau produk punya minimumDp, FULL kalau bayar lunas langsung',
    enum: OrderPaymentType,
    example: OrderPaymentType.DP,
  })
  @IsIn(Object.values(OrderPaymentType))
  paymentType: OrderPaymentType;
}
