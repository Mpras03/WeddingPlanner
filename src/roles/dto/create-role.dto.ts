import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateRoleDto {

  @ApiProperty({
    example: 'Administrator'
  })
  @IsString()
  @IsNotEmpty()
  roleName: string;

  @ApiProperty({
    example: 'Administrator System',
    required: false
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: true
  })
  @IsBoolean()
  active: boolean;

}