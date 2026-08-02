import { Module } from '@nestjs/common';
import { RegisterService } from './register.service';
import { RegisterController } from './register.controller';
import { CryptographyModule } from '../cryptography/cryptography.module';

@Module({
  imports: [
    CryptographyModule,
  ],
  providers: [RegisterService],
  controllers: [RegisterController],
})
export class RegisterModule {}