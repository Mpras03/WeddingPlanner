import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import type { Request } from 'express';
import { VendorProductReviewsService } from './vendor-product-reviews.service';
import { CreateVendorProductReviewDto } from './dto/create-vendor-product-review.dto';
import { FindAllVendorProductReviewDto } from './dto/find-all-vendor-product-review.dto';
import { JwtAuthGuard } from '../../master/auth/guards/jwt-auth.guard';
import { ResponseMessage } from '../../../common/response/decorators/response-message.decorator';
import {
  ApiFindAllVendorProductReview,
  ApiFindOneVendorProductReview,
  ApiCreateVendorProductReview,
} from './decorators/vendor-product-reviews-swagger.decorator';

// Nama field file "images" mengikuti konvensi upload multi-file di module vendor-products.
const VENDOR_PRODUCT_REVIEW_FILE_FIELDS = FileFieldsInterceptor([
  { name: 'images', maxCount: 10 },
]);

@ApiTags('Vendor Product Reviews')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('vendor-product-reviews')
export class VendorProductReviewsController {

  constructor(
    private readonly vendorProductReviewsService: VendorProductReviewsService,
  ) {}

  @Get()
  @ResponseMessage("Success Get All Vendor Product Review")
  @ApiFindAllVendorProductReview()
  findAll(
    @Query() query: FindAllVendorProductReviewDto,
  ) {
    return this.vendorProductReviewsService.findAll(query);
  }

  @Get(':id')
  @ResponseMessage("Success Get Vendor Product Review By Id")
  @ApiFindOneVendorProductReview()
  findOne(
    @Param('id') id: string,
  ) {
    return this.vendorProductReviewsService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ResponseMessage("Success Create Vendor Product Review")
  @UseInterceptors(VENDOR_PRODUCT_REVIEW_FILE_FIELDS)
  @ApiConsumes('multipart/form-data')
  @ApiCreateVendorProductReview()
  create(
    @Body() dto: CreateVendorProductReviewDto,
    @UploadedFiles() files: { images?: Express.Multer.File[] },
    @Req() request: Request,
  ) {
    const user = request.user as any;
    return this.vendorProductReviewsService.create(dto, files ?? {}, user?.userId ?? null);
  }

}
