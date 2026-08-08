import { Module } from '@nestjs/common';
import { RegisterService } from './register.service';
import { RegisterController } from './register.controller';
import { CryptographyModule } from '../cryptography/cryptography.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    CryptographyModule,
    AuthModule,
  ],
  providers: [RegisterService],
  controllers: [RegisterController],
})
export class RegisterModule {}