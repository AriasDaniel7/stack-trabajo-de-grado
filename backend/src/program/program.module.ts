import { Module } from '@nestjs/common';
import { ProgramService } from './program.service';
import { ProgramController } from './program.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProgramEntity } from '@database/entities/program';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([ProgramEntity])],
  controllers: [ProgramController],
  providers: [ProgramService],
})
export class ProgramModule {}
