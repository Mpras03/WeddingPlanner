import { Module } from '@nestjs/common';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { CryptographyModule } from '../cryptography/cryptography.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies/jwt.strategy';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRole } from '../user-roles/entities/user-role.entity';
import { Otp } from './entities/otp.entity';
import { OtpService } from './otp/otp.service';
import { MailService } from './mail/mail.service';

@Module({
  imports: [
    UsersModule,
    CryptographyModule,
    PassportModule,
    TypeOrmModule.forFeature([
        UserRole,
        Otp,
    ]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (
        configService: ConfigService,
      ): JwtModuleOptions => ({
        secret: configService.getOrThrow<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.getOrThrow<string>('JWT_EXPIRES_IN') as any,
        },
      }),
    })
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, OtpService, MailService],
  exports: [OtpService],
})
export class AuthModule {}