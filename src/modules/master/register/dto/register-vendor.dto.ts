import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class RegisterVendorDto {

  @ApiProperty({
    example: 'John Doe',
  })
  @Transform(({ value }) => value?.trim())
  @IsString()
  @IsNotEmpty()
  ownerName: string;

  @ApiProperty({
    example: 'Kencana Wedding Organizer',
  })
  @Transform(({ value }) => value?.trim())
  @IsString()
  @IsNotEmpty()
  businessName: string;

  @ApiProperty({
    example: 'vendor@example.com',
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
  businessPhone: string;

  @ApiProperty({
    example: 'Jl. Sudirman No. 45, Jakarta',
  })
  @Transform(({ value }) => value?.trim())
  @IsString()
  @IsNotEmpty()
  businessAddress: string;

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