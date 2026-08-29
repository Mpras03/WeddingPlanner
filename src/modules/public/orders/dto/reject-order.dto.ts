import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RejectOrderDto {
  @ApiProperty({
    description: 'Alasan vendor menolak pesanan ini',
    example: 'Tanggal yang diminta sudah penuh',
  })
  @IsString()
  @IsNotEmpty()
  rejectReason: string;
}
