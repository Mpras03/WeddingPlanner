import { UsersService } from './users.service';
import { Controller, Param, ParseIntPipe, Body, Get, Post, Put, Delete, HttpCode, HttpStatus, UseGuards, Query } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { FindAllUsersDto } from './dto/find-all-users.dto';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ResponseMessage } from '../common/response/decorators/response-message.decorator';
import {
  ApiGetAllUsers,
  ApiGetUserById,
  ApiCreateUser,
  ApiUpdateUser,
  ApiDeleteUser,
} from './decorators/users-swagger.decorator';

@ApiTags('Users')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {

    constructor(
        private readonly usersService: UsersService,
      ) {}


    @Get()
    @ResponseMessage("Success Get All Users")
    @ApiGetAllUsers()
    findAll(
        @Query() query: FindAllUsersDto,
    ){
        return this.usersService.findAll(query);
    }

    @Get(':id')
    @ResponseMessage("Success Get User By Id")
    @ApiGetUserById()
    findOne(
    @Param('id',ParseIntPipe)
    id:number
    ){
    return this.usersService.findOne(id);
    }

    @Post()
    @ResponseMessage("Success Create User")
    @ApiCreateUser()
    create(
    @Body() dto: CreateUserDto,
    ) {
    return this.usersService.create(dto);
    }

    @Put(':id')
    @ResponseMessage("Success Update User")
    @ApiUpdateUser()
    update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserDto,
    ) {
    return this.usersService.update(id, dto);
    }

    @Delete(':id')
    @ResponseMessage("Success Delete User")
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiDeleteUser()
    remove(
        @Param('id', ParseIntPipe)
        id: number,
    ) {
        return this.usersService.remove(id);
    }
}