import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CustomerProfileService } from './customer-profile.service';
import { CreateCustomerProfileDto } from './dto/create-customer-profile.dto';
import { UpdateCustomerProfileDto } from './dto/update-customer-profile.dto';
import { FindAllCustomerProfileDto } from './dto/find-all-customer-profile.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ResponseMessage } from '../../../common/response/decorators/response-message.decorator';
import {
  ApiGetAllCustomerProfile,
  ApiGetCustomerProfileById,
  ApiGetCustomerProfileByUserId,
  ApiCreateCustomerProfile,
  ApiUpdateCustomerProfile,
  ApiDeleteCustomerProfile,
} from './decorators/customer-profile-swagger.decorator';

@ApiTags('Customer Profile')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('customer-profile')
export class CustomerProfileController {

  constructor(
    private readonly customerProfileService: CustomerProfileService,
  ) {}

  @Get()
  @ResponseMessage("Success Get All Customer Profile")
  @ApiGetAllCustomerProfile()
  findAll(
    @Query() query: FindAllCustomerProfileDto,
  ) {
    return this.customerProfileService.findAll(query);
  }

  @Get(':id')
  @ResponseMessage("Success Get Customer Profile By Id")
  @ApiGetCustomerProfileById()
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.customerProfileService.findOne(id);
  }

  @Get('user/:userId')
  @ResponseMessage("Success Get Customer Profile By User Id")
  @ApiGetCustomerProfileByUserId()
  findByUserId(
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    return this.customerProfileService.findByUserId(userId);
  }

  @Post()
  @ResponseMessage("Success Create Customer Profile")
  @ApiCreateCustomerProfile()
  create(
    @Body() dto: CreateCustomerProfileDto,
  ) {
    return this.customerProfileService.create(dto);
  }

  @Put(':id')
  @ResponseMessage("Success Update Customer Profile")
  @ApiUpdateCustomerProfile()
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCustomerProfileDto,
  ) {
    return this.customerProfileService.update(id, dto);
  }

  @Delete(':id')
  @ResponseMessage("Success Delete Customer Profile")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiDeleteCustomerProfile()
  remove(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.customerProfileService.remove(id);
  }

}