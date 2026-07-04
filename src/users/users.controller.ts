import { Controller } from '@nestjs/common';
import { UsersService } from './users.service';
import { Body, Post, Put, Delete } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Users')
@Controller('users')
export class UsersController {

    constructor(
        private readonly usersService: UsersService,
      ) {}


    @Post()
    @ApiOperation({summary: 'Create User',})
    create(
    @Body() dto: CreateUserDto,
    ) {
    return this.usersService.create(dto);
    }
}
