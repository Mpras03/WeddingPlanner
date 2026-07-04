import { Body, Controller, Param, ParseIntPipe, Post,} from '@nestjs/common';
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

}
