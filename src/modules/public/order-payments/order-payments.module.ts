import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderPaymentsService } from './order-payments.service';
import { OrderPaymentsController } from './order-payments.controller';
import { OrderPayment } from './entities/order-payment.entity';
import { Order } from '../orders/entities/order.entity';
import { CustomerProfile } from '../../master/customer-profile/entities/customer-profile.entity';
import { AttachmentModule } from '../../master/attachment/attachment.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      OrderPayment,
      Order,
      CustomerProfile,
    ]),
    AttachmentModule,
  ],
  providers: [OrderPaymentsService],
  controllers: [OrderPaymentsController],
  exports: [OrderPaymentsService],
})
export class OrderPaymentsModule {}
