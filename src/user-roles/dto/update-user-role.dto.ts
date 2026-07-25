import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional } from 'class-validator';

export class UpdateUserRoleDto {
  @ApiPropertyOptional({
    description: 'Id user baru, jika ingin memindahkan assignment role ini ke user lain',
    example: 2,
  })
  @IsOptional()
  @IsInt()
  userId?: number;

  @ApiPropertyOptional({
    description: 'Id role baru, jika ingin mengganti role dari assignment ini',
    example: 3,
  })
  @IsOptional()
  @IsInt()
  roleId?: number;

  @ApiPropertyOptional({
    description: 'Apakah role ini menjadi role utama (primary) untuk user tersebut. Jika true, role primary lain milik user tersebut otomatis di-unset.',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;
}