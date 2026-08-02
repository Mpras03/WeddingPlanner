import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class RegisterCustomerDto {

  @ApiProperty({
    example: 'Jane Doe',
  })
  @Transform(({ value }) => value?.trim())
  @IsString()
  @IsNotEmpty()
  fullname: string;

  @ApiProperty({
    example: 'jane@example.com',
  })
  @Transform(({ value }) => value?.trim())
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: '081234567890',
  })
  @Transform(({ value }) => value?.trim())
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @ApiProperty({
    description: 'Password dalam bentuk cipherText hasil dari POST /cryptography/encrypt',
    example: 'gk2mQY3f8h1sJd0aB9xLZQ==:8sM3nQpV1cKzT7hD2wRfXg==',
  })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({
    description: 'Konfirmasi password, juga dalam bentuk cipherText hasil dari POST /cryptography/encrypt',
    example: 'gk2mQY3f8h1sJd0aB9xLZQ==:8sM3nQpV1cKzT7hD2wRfXg==',
  })
  @IsString()
  @IsNotEmpty()
  confirmPassword: string;

}