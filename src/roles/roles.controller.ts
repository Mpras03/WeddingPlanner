import { ApiOperation, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { RolesService } from './roles.service';
import { Controller, Get, Param, ParseIntPipe, Body, Post, Put, Delete, UseGuards } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';


@ApiTags('Roles')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('roles')
export class RolesController {

  constructor(
    private readonly rolesService: RolesService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Get All Role',
    })
  async findAll() {
    return await this.rolesService.findAll();
  }

  @Get(':id')
    @ApiOperation({
    summary: 'Get Role By Id',
    })
    findOne(
    @Param('id', ParseIntPipe) id: number,
    ) {
    return this.rolesService.findOne(id);
  }

  @Post()
  @ApiOperation({
    summary: 'Create Role',
    })
    create(
        @Body() dto: CreateRoleDto,
    ){
        return this.rolesService.create(dto);
    }

    @Put(':id')
    @ApiOperation({
        summary: 'Update Role',
        })
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateRoleDto,
        ) {
        return this.rolesService.update(id, dto);
        }

  @Delete(':id')
    @ApiOperation({summary: 'Delete Role',})
    remove(
        @Param('id', ParseIntPipe) id: number,
        ) {
        return this.rolesService.remove(id);
    }
}