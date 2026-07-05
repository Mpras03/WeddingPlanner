import { Body, Controller, Param, ParseIntPipe, Post, Get, Delete, HttpCode, HttpStatus, UseGuards} from '@nestjs/common';
import { ApiOperation, ApiTags, ApiBearerAuth} from '@nestjs/swagger';
import { UserRolesService } from './user-roles.service';
import { CreateUserRoleDto } from './dto/create-user-role.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ResponseMessage } from '../common/response/decorators/response-message.decorator';

@ApiTags('User Roles')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UserRolesController {

  constructor(
    private readonly userRolesService: UserRolesService,
  ) {}

  @Post(':userId/roles')
  @ResponseMessage("Success Assign Role To User")
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
  @ResponseMessage("Success Get User Roles")
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
  @ResponseMessage("Success Remove Role From User")
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
