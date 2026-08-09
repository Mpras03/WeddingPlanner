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
import { VendorProfileService } from './vendor-profile.service';
import { CreateVendorProfileDto } from './dto/create-vendor-profile.dto';
import { UpdateVendorProfileDto } from './dto/update-vendor-profile.dto';
import { FindAllVendorProfileDto } from './dto/find-all-vendor-profile.dto';
import { SaveVendorProfileDto } from './dto/save-vendor-profile.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ResponseMessage } from '../../../common/response/decorators/response-message.decorator';
import {
  ApiGetAllVendorProfile,
  ApiGetVendorProfileById,
  ApiGetVendorProfileByUserId,
  ApiCreateVendorProfile,
  ApiUpdateVendorProfile,
  ApiDeleteVendorProfile,
  ApiSaveDraftVendorProfile,
  ApiSubmitVendorProfile,
} from './decorators/vendor-profile-swagger.decorator';

// Nama field file "verificationDocumentFiles" sengaja dibedakan dari field JSON metadata
// "verificationDocuments" karena multer tidak bisa menampung part teks dan file di field bernama sama.
const SAVE_VENDOR_PROFILE_FILE_FIELDS = FileFieldsInterceptor([
  { name: 'portfolioImages', maxCount: 10 },
  { name: 'verificationDocumentFiles', maxCount: 10 },
]);

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

  @Post('save-draft')
  @ResponseMessage("Success Save Draft Vendor Profile")
  @UseInterceptors(SAVE_VENDOR_PROFILE_FILE_FIELDS)
  @ApiConsumes('multipart/form-data')
  @ApiSaveDraftVendorProfile()
  saveDraft(
    @Body() dto: SaveVendorProfileDto,
    @UploadedFiles() files: { portfolioImages?: Express.Multer.File[]; verificationDocumentFiles?: Express.Multer.File[] },
    @Req() request: Request,
  ) {
    const user = request.user as any;
    return this.vendorProfileService.saveDraft(dto, files ?? {}, user?.userId ?? null);
  }

  @Post('submit')
  @ResponseMessage("Success Submit Vendor Profile")
  @UseInterceptors(SAVE_VENDOR_PROFILE_FILE_FIELDS)
  @ApiConsumes('multipart/form-data')
  @ApiSubmitVendorProfile()
  submit(
    @Body() dto: SaveVendorProfileDto,
    @UploadedFiles() files: { portfolioImages?: Express.Multer.File[]; verificationDocumentFiles?: Express.Multer.File[] },
    @Req() request: Request,
  ) {
    const user = request.user as any;
    return this.vendorProfileService.submit(dto, files ?? {}, user?.userId ?? null);
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