import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RejectOrderPaymentDto {
  @ApiProperty({
    description:
      'Alasan penolakan bukti pembayaran (mis. bukti tidak jelas, nominal tidak sesuai) — juga dipakai untuk kasus "minta upload ulang"',
    example: 'Nominal transfer tidak sesuai dengan tagihan',
  })
  @IsString()
  @IsNotEmpty()
  rejectReason: string;
}
