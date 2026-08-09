import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttachmentController } from './attachment.controller';
import { AttachmentService } from './attachment.service';
import { Attachment } from './entities/attachment.entity';
import { LocalStorageProvider } from './storage/local-storage.provider';
import { STORAGE_PROVIDER } from './storage/storage-provider.interface';

@Module({
  imports: [TypeOrmModule.forFeature([Attachment])],
  controllers: [AttachmentController],
  providers: [
    AttachmentService,
    { provide: STORAGE_PROVIDER, useClass: LocalStorageProvider },
  ],
  exports: [AttachmentService],
})
export class AttachmentModule {}
