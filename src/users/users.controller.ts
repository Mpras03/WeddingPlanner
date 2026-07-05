import { UsersService } from './users.service';
import { Controller, Param, ParseIntPipe, Body, Get, Post, Put, Delete, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiOperation, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ResponseMessage } from '../common/response/decorators/response-message.decorator';

@ApiTags('Users')
@ApiBearerAuth('JWT')
// @UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {

    constructor(
        private readonly usersService: UsersService,
      ) {}


    @Get()
    @ResponseMessage("Success Get All Users")
    @ApiOperation({
        summary:'Get All Users'
    })
    findAll(){
        return this.usersService.findAll();
    }

    @Get(':id')
    @ResponseMessage("Success Get User By Id")
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
    @ResponseMessage("Success Create User")
    @ApiOperation({summary: 'Create User',})
    create(
    @Body() dto: CreateUserDto,
    ) {
    return this.usersService.create(dto);
    }

    @Put(':id')
    @ResponseMessage("Success Update User")
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
    @ResponseMessage("Success Delete User")
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
