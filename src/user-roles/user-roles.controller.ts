import { Body, Controller, Param, ParseIntPipe, Post, Get, Put, Delete, HttpCode, HttpStatus, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { UserRolesService } from './user-roles.service';
import { CreateUserRoleDto } from './dto/create-user-role.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { FindAllUserRolesDto } from './dto/find-all-user-roles.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ResponseMessage } from '../common/response/decorators/response-message.decorator';
import {
  ApiGetAllUserRoles,
  ApiAssignRoleToUser,
  ApiGetUserRoles,
  ApiUpdateUserRole,
  ApiRemoveRoleFromUser,
} from './decorators/user-roles-swagger.decorator';

@ApiTags('User Roles')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('user-roles')
export class UserRolesController {

  constructor(
    private readonly userRolesService: UserRolesService,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ResponseMessage("Success Get All User Roles")
  @ApiGetAllUserRoles()
  findAll(
    @Query()
    query: FindAllUserRolesDto,
  ) {
    return this.userRolesService.findAll(query);
  }

  @Put(':id')
  @ResponseMessage("Success Update User Role")
  @ApiUpdateUserRole()
  update(
    @Param('id', ParseIntPipe)
    id: number,

    @Body()
    dto: UpdateUserRoleDto,
  ) {
    return this.userRolesService.update(id, dto);
  }

  @Post(':userId')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage("Success Assign Role To User")
  @ApiAssignRoleToUser()
  create(
    @Param('userId', ParseIntPipe)
    userId: number,

    @Body()
    dto: CreateUserRoleDto,
  ) {
    return this.userRolesService.create(
      userId,
      dto,
    );
  }


  @Get(':userId')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage("Success Get User Roles")
  @ApiGetUserRoles()
  findRolesByUser(
    @Param('userId', ParseIntPipe)
    userId: number,
  ) {
    return this.userRolesService.findRolesByUser(userId);
  }


  @Delete(':userId/:roleId')
  @ResponseMessage("Success Remove Role From User")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiRemoveRoleFromUser()
  removeRole(
    @Param('userId', ParseIntPipe)
    userId: number,

    @Param('roleId', ParseIntPipe)
    roleId: number,
  ) {
    return this.userRolesService.removeRole(
      userId,
      roleId,
    );
  }

}