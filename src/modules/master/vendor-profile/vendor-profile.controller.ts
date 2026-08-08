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
import { VendorProfileService } from './vendor-profile.service';
import { CreateVendorProfileDto } from './dto/create-vendor-profile.dto';
import { UpdateVendorProfileDto } from './dto/update-vendor-profile.dto';
import { FindAllVendorProfileDto } from './dto/find-all-vendor-profile.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ResponseMessage } from '../../../common/response/decorators/response-message.decorator';
import {
  ApiGetAllVendorProfile,
  ApiGetVendorProfileById,
  ApiGetVendorProfileByUserId,
  ApiCreateVendorProfile,
  ApiUpdateVendorProfile,
  ApiDeleteVendorProfile,
} from './decorators/vendor-profile-swagger.decorator';

@ApiTags('Vendor Profile')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('vendor-profile')
export class VendorProfileController {

  constructor(
    private readonly vendorProfileService: VendorProfileService,
  ) {}

  @Get()
  @ResponseMessage("Success Get All Vendor Profile")
  @ApiGetAllVendorProfile()
  findAll(
    @Query() query: FindAllVendorProfileDto,
  ) {
    return this.vendorProfileService.findAll(query);
  }

  @Get(':id')
  @ResponseMessage("Success Get Vendor Profile By Id")
  @ApiGetVendorProfileById()
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.vendorProfileService.findOne(id);
  }

  @Get('user/:userId')
  @ResponseMessage("Success Get Vendor Profile By User Id")
  @ApiGetVendorProfileByUserId()
  findByUserId(
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    return this.vendorProfileService.findByUserId(userId);
  }

  @Post()
  @ResponseMessage("Success Create Vendor Profile")
  @ApiCreateVendorProfile()
  create(
    @Body() dto: CreateVendorProfileDto,
  ) {
    return this.vendorProfileService.create(dto);
  }

  @Put(':id')
  @ResponseMessage("Success Update Vendor Profile")
  @ApiUpdateVendorProfile()
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateVendorProfileDto,
  ) {
    return this.vendorProfileService.update(id, dto);
  }

  @Delete(':id')
  @ResponseMessage("Success Delete Vendor Profile")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiDeleteVendorProfile()
  remove(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.vendorProfileService.remove(id);
  }

}