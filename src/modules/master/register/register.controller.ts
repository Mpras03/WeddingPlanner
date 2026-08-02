import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RegisterService } from './register.service';
import { RegisterCustomerDto } from './dto/register-customer.dto';
import { RegisterVendorDto } from './dto/register-vendor.dto';
import { ResponseMessage } from '../../../common/response/decorators/response-message.decorator';
import { ApiRegisterCustomer, ApiRegisterVendor } from './decorators/register-swagger.decorator';

@ApiTags('Register')
@Controller('register')
export class RegisterController {

  constructor(
    private readonly registerService: RegisterService,
  ) {}

  @Post('customer')
  @HttpCode(HttpStatus.CREATED)
  @ResponseMessage("Success Register Customer")
  @ApiRegisterCustomer()
  registerCustomer(
    @Body() dto: RegisterCustomerDto,
  ) {
    return this.registerService.registerCustomer(dto);
  }

  @Post('vendor')
  @HttpCode(HttpStatus.CREATED)
  @ResponseMessage("Success Register Vendor")
  @ApiRegisterVendor()
  registerVendor(
    @Body() dto: RegisterVendorDto,
  ) {
    return this.registerService.registerVendor(dto);
  }

}