import { Module } from '@nestjs/common';
import { CryptographyService } from './cryptography.service';
import { CryptographyController } from './cryptography.controller';

@Module({
  providers: [CryptographyService],
  controllers: [CryptographyController],
  exports: [CryptographyService],
})
export class CryptographyModule {}