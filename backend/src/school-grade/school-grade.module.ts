import { Module } from '@nestjs/common';
import { SchoolGradeService } from './school-grade.service';
import { SchoolGradeController } from './school-grade.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SchoolGradeEntity } from '@database/entities/school-grade';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([SchoolGradeEntity])],
  controllers: [SchoolGradeController],
  providers: [SchoolGradeService],
  exports: [SchoolGradeService],
})
export class SchoolGradeModule {}
