import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { ParameterService } from './parameter.service';
import { ParameterController } from './parameter.controller';
import { ParameterHeader } from './entities/parameter-header.entity';
import { ParameterDetail } from './entities/parameter-detail.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ParameterHeader, ParameterDetail])],
  providers: [ParameterService],
  controllers: [ParameterController],
})
export class ParameterModule {}
