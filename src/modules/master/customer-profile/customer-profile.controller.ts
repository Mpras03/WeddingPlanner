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
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import type { Request } from 'express';
import { CustomerProfileService } from './customer-profile.service';
import { CreateCustomerProfileDto } from './dto/create-customer-profile.dto';
import { UpdateCustomerProfileDto } from './dto/update-customer-profile.dto';
import { FindAllCustomerProfileDto } from './dto/find-all-customer-profile.dto';
import { SaveCustomerProfileDto } from './dto/save-customer-profile.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ResponseMessage } from '../../../common/response/decorators/response-message.decorator';
import {
  ApiGetAllCustomerProfile,
  ApiGetCustomerProfileById,
  ApiGetCustomerProfileByUserId,
  ApiCreateCustomerProfile,
  ApiUpdateCustomerProfile,
  ApiDeleteCustomerProfile,
  ApiSaveDraftCustomerProfile,
  ApiSubmitCustomerProfile,
} from './decorators/customer-profile-swagger.decorator';

// Field file foto profil sengaja dipisah dari body JSON lainnya karena multipart/form-data
// tidak bisa menampung part teks dan file di field bernama sama (sama seperti vendor-profile).
const SAVE_CUSTOMER_PROFILE_FILE_FIELDS = FileFieldsInterceptor([
  { name: 'avatarPhoto', maxCount: 1 },
]);

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

  @Post('save-draft')
  @ResponseMessage("Success Save Draft Customer Profile")
  @UseInterceptors(SAVE_CUSTOMER_PROFILE_FILE_FIELDS)
  @ApiConsumes('multipart/form-data')
  @ApiSaveDraftCustomerProfile()
  saveDraft(
    @Body() dto: SaveCustomerProfileDto,
    @UploadedFiles() files: { avatarPhoto?: Express.Multer.File[] },
    @Req() request: Request,
  ) {
    const user = request.user as any;
    return this.customerProfileService.saveDraft(dto, files ?? {}, user?.userId ?? null);
  }

  @Post('submit')
  @ResponseMessage("Success Submit Customer Profile")
  @UseInterceptors(SAVE_CUSTOMER_PROFILE_FILE_FIELDS)
  @ApiConsumes('multipart/form-data')
  @ApiSubmitCustomerProfile()
  submit(
    @Body() dto: SaveCustomerProfileDto,
    @UploadedFiles() files: { avatarPhoto?: Express.Multer.File[] },
    @Req() request: Request,
  ) {
    const user = request.user as any;
    return this.customerProfileService.submit(dto, files ?? {}, user?.userId ?? null);
  }

  @Put(':id')
  @ResponseMessage("Success Update Customer Profile")
  @UseInterceptors(SAVE_CUSTOMER_PROFILE_FILE_FIELDS)
  @ApiConsumes('multipart/form-data')
  @ApiUpdateCustomerProfile()
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCustomerProfileDto,
    @UploadedFiles() files: { avatarPhoto?: Express.Multer.File[] },
    @Req() request: Request,
  ) {
    const user = request.user as any;
    return this.customerProfileService.update(id, dto, files ?? {}, user?.userId ?? null);
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