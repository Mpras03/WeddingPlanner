import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateUserRoleDto {
  @ApiProperty({
    description: 'Id role yang akan di-assign ke user',
    example: 1,
  })
  @IsNotEmpty()
  @IsInt()
  roleId: number;

  @ApiPropertyOptional({
    description: 'Apakah role ini menjadi role utama (primary) untuk user tersebut. Jika true, role primary lain milik user ini otomatis di-unset.',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean = false;
}