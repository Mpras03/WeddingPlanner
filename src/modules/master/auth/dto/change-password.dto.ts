import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({
    description: 'Email user yang sudah melalui verifikasi OTP forgot password',
    example: 'johndoe@example.com',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Password baru dalam bentuk cipherText hasil dari POST /cryptography/encrypt',
    example: 'gk2mQY3f8h1sJd0aB9xLZQ==:8sM3nQpV1cKzT7hD2wRfXg==',
  })
  @IsNotEmpty()
  @IsString()
  newPassword: string;

  @ApiProperty({
    description: 'Konfirmasi password baru, juga dalam bentuk cipherText hasil dari POST /cryptography/encrypt',
    example: 'gk2mQY3f8h1sJd0aB9xLZQ==:8sM3nQpV1cKzT7hD2wRfXg==',
  })
  @IsNotEmpty()
  @IsString()
  confirmNewPassword: string;
}
