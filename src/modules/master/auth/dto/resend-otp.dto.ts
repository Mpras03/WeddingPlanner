import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty } from 'class-validator';
import { OtpPurpose } from '../otp/otp-purpose.enum';

export class ResendOtpDto {
  @ApiProperty({
    description: 'Email user',
    example: 'johndoe@example.com',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Tujuan OTP yang ingin dikirim ulang',
    enum: OtpPurpose,
    example: OtpPurpose.REGISTER,
  })
  @IsNotEmpty()
  @IsEnum(OtpPurpose)
  purpose: OtpPurpose;
}
