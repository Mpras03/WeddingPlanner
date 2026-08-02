import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VendorProfileService } from './vendor-profile.service';
import { VendorProfileController } from './vendor-profile.controller';
import { VendorProfile } from './entities/vendor-profile.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      VendorProfile,
      User,
    ]),
  ],
  providers: [VendorProfileService],
  controllers: [VendorProfileController],
  exports: [VendorProfileService],
})
export class VendorProfileModule {}