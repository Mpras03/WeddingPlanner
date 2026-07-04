import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';

export class CreateUserRoleDto {

  @ApiProperty({
    example: 2,
  })
  @IsInt()
  roleId: number;

}