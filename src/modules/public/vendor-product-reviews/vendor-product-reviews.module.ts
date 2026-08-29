import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VendorProductReviewsService } from './vendor-product-reviews.service';
import { VendorProductReviewsController } from './vendor-product-reviews.controller';
import { VendorProductReview } from './entities/vendor-product-review.entity';
import { Order } from '../orders/entities/order.entity';
import { CustomerProfile } from '../../master/customer-profile/entities/customer-profile.entity';
import { AttachmentModule } from '../../master/attachment/attachment.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      VendorProductReview,
      Order,
      CustomerProfile,
    ]),
    AttachmentModule,
  ],
  providers: [VendorProductReviewsService],
  controllers: [VendorProductReviewsController],
  exports: [VendorProductReviewsService],
})
export class VendorProductReviewsModule {}
