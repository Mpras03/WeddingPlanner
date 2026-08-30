import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class DisputeOrderDto {
  @ApiProperty({
    description: 'Alasan sengketa diajukan',
    example: 'Vendor tidak hadir sesuai jadwal yang disepakati',
  })
  @IsString()
  @IsNotEmpty()
  reason: string;
}
