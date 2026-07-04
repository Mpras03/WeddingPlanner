import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RolesService } from './roles.service';
import { Body, Post } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';

@ApiTags('Roles')
@Controller('roles')
export class RolesController {

  constructor(
    private readonly rolesService: RolesService,
  ) {}

  @Get('get-all')
  async findAll() {
    return await this.rolesService.findAll();
  }

  @Post('create')
    create(
        @Body() dto: CreateRoleDto,
    ){
        return this.rolesService.create(dto);
    }
}