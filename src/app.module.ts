import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolesModule } from './modules/master/roles/roles.module';
import { UsersModule } from './modules/master/users/users.module';
import { UserRolesModule } from './modules/master/user-roles/user-roles.module';
import { AuthModule } from './modules/master/auth/auth.module';
import { CryptographyModule } from './modules/master/cryptography/cryptography.module';
import { CustomerProfileModule } from './modules/master/customer-profile/customer-profile.module';
import { VendorProfileModule } from './modules/master/vendor-profile/vendor-profile.module';
import { RegisterModule } from './modules/master/register/register.module';
import { AttachmentModule } from './modules/master/attachment/attachment.module';
import { ParameterModule } from './modules/master/parameter/parameter.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      autoLoadEntities: true,
      synchronize: false,
    }),

    RolesModule,

    UsersModule,

    UserRolesModule,

    AuthModule,

    CryptographyModule,

    CustomerProfileModule,

    VendorProfileModule,

    RegisterModule,

    AttachmentModule,

    ParameterModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
