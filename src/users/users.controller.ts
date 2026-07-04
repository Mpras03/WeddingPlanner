import { UsersService } from './users.service';
import { Controller, Param, ParseIntPipe, Body, Get, Post, Put, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Users')
@Controller('users')
export class UsersController {

    constructor(
        private readonly usersService: UsersService,
      ) {}


    @Get()
    @ApiOperation({
        summary:'Get All Users'
    })
    findAll(){
        return this.usersService.findAll();
    }

    @Get(':id')
    @ApiOperation({
        summary:'Get User By Id'
    })
    findOne(
    @Param('id',ParseIntPipe)
    id:number
    ){
    return this.usersService.findOne(id);
    }

    @Post()
    @ApiOperation({summary: 'Create User',})
    create(
    @Body() dto: CreateUserDto,
    ) {
    return this.usersService.create(dto);
    }

    @Put(':id')
    @ApiOperation({
    summary: 'Update User',
    })
    update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserDto,
    ) {
    return this.usersService.update(id, dto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({
        summary: 'Delete User',
    })
    remove(
        @Param('id', ParseIntPipe)
        id: number,
    ) {
        return this.usersService.remove(id);
    }
}
