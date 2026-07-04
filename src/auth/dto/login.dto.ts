import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class LoginDto {

  @ApiProperty({
    example: 'admin',
  })
  @IsNotEmpty()
  username: string;

  @ApiProperty({
    example: 'Password123',
  })
  @IsNotEmpty()
  password: string;

}