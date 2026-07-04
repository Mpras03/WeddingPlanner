import { Body, Controller, Param, ParseIntPipe, Post, Get, Delete, HttpCode, HttpStatus} from '@nestjs/common';
import { ApiOperation, ApiTags,} from '@nestjs/swagger';
import { UserRolesService } from './user-roles.service';
import { CreateUserRoleDto } from './dto/create-user-role.dto';

@ApiTags('User Roles')
@Controller('users')
export class UserRolesController {

  constructor(
    private readonly userRolesService: UserRolesService,
  ) {}

  @Post(':userId/roles')
  @ApiOperation({
    summary: 'Assign Role To User',
  })
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


  @Get(':userId/roles')
  @ApiOperation({
    summary: 'Get User Roles',
  })
  findRolesByUser(
    @Param('userId', ParseIntPipe)
    userId: number,
  ) {
    return this.userRolesService.findRolesByUser(userId);
  }


  @Delete(':userId/roles/:roleId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Remove Role From User',
  })
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
