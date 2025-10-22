import { Module } from '@nestjs/common';
import { ModalityService } from './modality.service';
import { ModalityController } from './modality.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ModalityEntity } from '@database/entities/modality';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([ModalityEntity])],
  controllers: [ModalityController],
  providers: [ModalityService],
  exports: [ModalityService],
})
export class ModalityModule {}
