import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { RolesService } from './roles.service';
import { Controller, Get, Param, ParseIntPipe, Body, Post, Put, Delete, UseGuards, Query } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { FindAllRoleDto } from './dto/find-all-role.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ResponseMessage } from '../../../common/response/decorators/response-message.decorator';
import {
  ApiFindAllRole,
  ApiFindOneRole,
  ApiCreateRole,
  ApiUpdateRole,
  ApiDeleteRole,
} from './decorators/roles-swagger.decorator';


@ApiTags('Roles')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('roles')
export class RolesController {

  constructor(
    private readonly rolesService: RolesService,
  ) {}

  @Get()
  @ResponseMessage("Success Get All Role")
  @ApiFindAllRole()
  async findAll(@Query() query: FindAllRoleDto) {
    return await this.rolesService.findAll(query);
  }

  @Get(':id')
  @ResponseMessage("Success Get Role By Id")
  @ApiFindOneRole()
  findOne(
    @Param('id', ParseIntPipe) id: number,
    ) {
    return this.rolesService.findOne(id);
  }

  @Post()
  @ResponseMessage("Success Create Role")
  @ApiCreateRole()
    create(
        @Body() dto: CreateRoleDto,
    ){
        return this.rolesService.create(dto);
    }

    @Put(':id')
    @ResponseMessage("Success Update Role")
    @ApiUpdateRole()
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateRoleDto,
        ) {
        return this.rolesService.update(id, dto);
        }

  @Delete(':id')
  @ResponseMessage("Success Delete Role")
  @ApiDeleteRole()
    remove(
        @Param('id', ParseIntPipe) id: number,
        ) {
        return this.rolesService.remove(id);
    }
}