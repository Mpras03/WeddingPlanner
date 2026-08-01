import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerProfileService } from './customer-profile.service';
import { CustomerProfileController } from './customer-profile.controller';
import { CustomerProfile } from './entities/customer-profile.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CustomerProfile,
      User,
    ]),
  ],
  providers: [CustomerProfileService],
  controllers: [CustomerProfileController],
})
export class CustomerProfileModule {}