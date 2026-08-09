import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VerificationDocumentsService } from './verification-documents.service';
import { VerificationDocumentsController } from './verification-documents.controller';
import { VerificationDocument } from './entities/verification-document.entity';
import { User } from '../users/entities/user.entity';
import { AttachmentModule } from '../attachment/attachment.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      VerificationDocument,
      User,
    ]),
    AttachmentModule,
  ],
  providers: [VerificationDocumentsService],
  controllers: [VerificationDocumentsController],
  exports: [VerificationDocumentsService],
})
export class VerificationDocumentsModule {}
