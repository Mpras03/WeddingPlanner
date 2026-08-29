import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

// orderId sengaja satu-satunya penghubung ke order — customer/vendor/vendorProduct selalu
// disnapshot server-side dari order tersebut (lihat VendorProductReviewsService.create), bukan
// dipercaya dari body, supaya customer tidak bisa membuat ulasan atas nama order milik orang lain.
export class CreateVendorProductReviewDto {
  @ApiProperty({
    description: 'Id order yang diulas — order ini harus milik sendiri dan berstatus COMPLETED',
    example: 1,
  })
  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  orderId: number;

  @ApiProperty({ description: 'Rating 1-5', example: 5 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiPropertyOptional({
    description: 'Komentar ulasan',
    example: 'Pelayanan sangat memuaskan, makanan enak dan tepat waktu!',
  })
  @IsOptional()
  @IsString()
  comment?: string;
}
