import { ApiOperation, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { RolesService } from './roles.service';
import { Controller, Get, Param, ParseIntPipe, Body, Post, Put, Delete, UseGuards } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ResponseMessage } from '../common/response/decorators/response-message.decorator';


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
  @ApiOperation({
    summary: 'Get All Role',
    })
  async findAll() {
    return await this.rolesService.findAll();
  }

  @Get(':id')
  @ResponseMessage("Success Get Role By Id")
    @ApiOperation({
    summary: 'Get Role By Id',
    })
    findOne(
    @Param('id', ParseIntPipe) id: number,
    ) {
    return this.rolesService.findOne(id);
  }

  @Post()
  @ResponseMessage("Success Create Role")
  @ApiOperation({
    summary: 'Create Role',
    })
    create(
        @Body() dto: CreateRoleDto,
    ){
        return this.rolesService.create(dto);
    }

    @Put(':id')
    @ResponseMessage("Success Update Role")
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
  @ResponseMessage("Success Delete Role")
    @ApiOperation({summary: 'Delete Role',})
    remove(
        @Param('id', ParseIntPipe) id: number,
        ) {
        return this.rolesService.remove(id);
    }
}