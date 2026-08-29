import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { Order } from './entities/order.entity';
import { CustomerProfile } from '../../master/customer-profile/entities/customer-profile.entity';
import { VendorProfile } from '../../master/vendor-profile/entities/vendor-profile.entity';
import { VendorProduct } from '../../master/vendor-products/entities/vendor-product.entity';
import { BankAccount } from '../../master/bank-accounts/entities/bank-account.entity';
import { OrderPaymentsModule } from '../order-payments/order-payments.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Order,
      CustomerProfile,
      VendorProfile,
      VendorProduct,
      BankAccount,
    ]),
    OrderPaymentsModule,
  ],
  providers: [OrdersService],
  controllers: [OrdersController],
  exports: [OrdersService],
})
export class OrdersModule {}
