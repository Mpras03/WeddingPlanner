import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ParameterService } from './parameter.service';
import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Body,
  Post,
  Put,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { CreateParameterDto } from './dto/create-parameter.dto';
import { UpdateParameterDto } from './dto/update-parameter.dto';
import { FindAllParameterDto } from './dto/find-all-parameter.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ResponseMessage } from '../../../common/response/decorators/response-message.decorator';
import {
  ApiFindAllParameter,
  ApiFindOneParameter,
  ApiFindOneParameterDetail,
  ApiCreateParameter,
  ApiUpdateParameter,
  ApiDeleteParameter,
} from './decorators/parameter-swagger.decorator';

@ApiTags('Parameter')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('parameter')
export class ParameterController {
  constructor(private readonly parameterService: ParameterService) {}

  @Get()
  @ResponseMessage('Success Get All Parameter')
  @ApiFindAllParameter()
  findAll(@Query() query: FindAllParameterDto) {
    return this.parameterService.findAll(query);
  }

  @Get('detail/:id')
  @ResponseMessage('Success Get Parameter Detail By Id')
  @ApiFindOneParameterDetail()
  findOneDetail(@Param('id', ParseIntPipe) id: number) {
    return this.parameterService.findOneDetail(String(id));
  }

  @Get(':id')
  @ResponseMessage('Success Get Parameter By Id')
  @ApiFindOneParameter()
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.parameterService.findOne(String(id));
  }

  @Post()
  @ResponseMessage('Success Create Parameter')
  @ApiCreateParameter()
  create(@Body() dto: CreateParameterDto) {
    return this.parameterService.create(dto);
  }

  @Put(':id')
  @ResponseMessage('Success Update Parameter')
  @ApiUpdateParameter()
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateParameterDto,
  ) {
    return this.parameterService.update(String(id), dto);
  }

  @Delete(':id')
  @ResponseMessage('Success Delete Parameter')
  @ApiDeleteParameter()
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.parameterService.remove(String(id));
  }
}
