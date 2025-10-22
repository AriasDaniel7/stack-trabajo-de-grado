import { Module } from '@nestjs/common';
import { MethodologyService } from './methodology.service';
import { MethodologyController } from './methodology.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MethodologyEntity } from '@database/entities/methodology';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([MethodologyEntity])],
  controllers: [MethodologyController],
  providers: [MethodologyService],
})
export class MethodologyModule {}
