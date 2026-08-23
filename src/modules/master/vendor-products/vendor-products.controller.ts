import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
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
import { VendorProductsService } from './vendor-products.service';
import { CreateVendorProductDto } from './dto/create-vendor-product.dto';
import { UpdateVendorProductDto } from './dto/update-vendor-product.dto';
import { FindAllVendorProductDto } from './dto/find-all-vendor-product.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ResponseMessage } from '../../../common/response/decorators/response-message.decorator';
import {
  ApiFindAllVendorProduct,
  ApiFindOneVendorProduct,
  ApiCreateVendorProduct,
  ApiUpdateVendorProduct,
  ApiDeleteVendorProduct,
} from './decorators/vendor-products-swagger.decorator';

// Nama field file "images" mengikuti field upload multi-file di form create product Frontend.
const VENDOR_PRODUCT_FILE_FIELDS = FileFieldsInterceptor([
  { name: 'images', maxCount: 10 },
]);

@ApiTags('Vendor Products')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('vendor-products')
export class VendorProductsController {

  constructor(
    private readonly vendorProductsService: VendorProductsService,
  ) {}

  @Get()
  @ResponseMessage("Success Get All Vendor Product")
  @ApiFindAllVendorProduct()
  findAll(
    @Query() query: FindAllVendorProductDto,
  ) {
    return this.vendorProductsService.findAll(query);
  }

  @Get(':id')
  @ResponseMessage("Success Get Vendor Product By Id")
  @ApiFindOneVendorProduct()
  findOne(
    @Param('id') id: string,
  ) {
    return this.vendorProductsService.findOne(id);
  }

  @Post()
  @ResponseMessage("Success Create Vendor Product")
  @UseInterceptors(VENDOR_PRODUCT_FILE_FIELDS)
  @ApiConsumes('multipart/form-data')
  @ApiCreateVendorProduct()
  create(
    @Body() dto: CreateVendorProductDto,
    @UploadedFiles() files: { images?: Express.Multer.File[] },
    @Req() request: Request,
  ) {
    const user = request.user as any;
    return this.vendorProductsService.create(dto, files ?? {}, user?.userId ?? null);
  }

  @Put(':id')
  @ResponseMessage("Success Update Vendor Product")
  @UseInterceptors(VENDOR_PRODUCT_FILE_FIELDS)
  @ApiConsumes('multipart/form-data')
  @ApiUpdateVendorProduct()
  update(
    @Param('id') id: string,
    @Body() dto: UpdateVendorProductDto,
    @UploadedFiles() files: { images?: Express.Multer.File[] },
    @Req() request: Request,
  ) {
    const user = request.user as any;
    return this.vendorProductsService.update(id, dto, files ?? {}, user?.userId ?? null);
  }

  @Delete(':id')
  @ResponseMessage("Success Delete Vendor Product")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiDeleteVendorProduct()
  remove(
    @Param('id') id: string,
  ) {
    return this.vendorProductsService.remove(id);
  }

}
