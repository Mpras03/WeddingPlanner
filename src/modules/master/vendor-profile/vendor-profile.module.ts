import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VendorProfileService } from './vendor-profile.service';
import { VendorProfileController } from './vendor-profile.controller';
import { VendorProfile } from './entities/vendor-profile.entity';
import { User } from '../users/entities/user.entity';
import { ContactsModule } from '../contacts/contacts.module';
import { BankAccountsModule } from '../bank-accounts/bank-accounts.module';
import { VerificationDocumentsModule } from '../verification-documents/verification-documents.module';
import { AttachmentModule } from '../attachment/attachment.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      VendorProfile,
      User,
    ]),
    ContactsModule,
    BankAccountsModule,
    VerificationDocumentsModule,
    AttachmentModule,
  ],
  providers: [VendorProfileService],
  controllers: [VendorProfileController],
  exports: [VendorProfileService],
})
export class VendorProfileModule {}
