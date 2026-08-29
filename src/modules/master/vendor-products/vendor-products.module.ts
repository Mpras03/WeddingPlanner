import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VendorProductsService } from './vendor-products.service';
import { VendorProductsController } from './vendor-products.controller';
import { VendorProduct } from './entities/vendor-product.entity';
import { VendorProfile } from '../vendor-profile/entities/vendor-profile.entity';
import { Order } from '../../public/orders/entities/order.entity';
import { AttachmentModule } from '../attachment/attachment.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      VendorProduct,
      VendorProfile,
      Order,
    ]),
    AttachmentModule,
  ],
  providers: [VendorProductsService],
  controllers: [VendorProductsController],
  exports: [VendorProductsService],
})
export class VendorProductsModule {}
