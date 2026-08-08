import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsString, Length } from 'class-validator';
import { OtpPurpose } from '../otp/otp-purpose.enum';

export class VerifyOtpDto {
  @ApiProperty({
    description: 'Email user',
    example: 'johndoe@example.com',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Kode OTP 6 digit yang dikirim ke email',
    example: '123456',
  })
  @IsNotEmpty()
  @IsString()
  @Length(6, 6)
  otpCode: string;

  @ApiProperty({
    description: 'Tujuan verifikasi OTP',
    enum: OtpPurpose,
    example: OtpPurpose.REGISTER,
  })
  @IsNotEmpty()
  @IsEnum(OtpPurpose)
  purpose: OtpPurpose;
}
