import { PartialType, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';
import { IsOptional, IsString } from 'class-validator';

export class UpdateUserDto {

    @ApiPropertyOptional({
    example: 'admin',
    })
    @IsOptional()
    username:string;

    @ApiPropertyOptional({
    example: 'Administrator',
    })
    @IsOptional()
    name:string;

}