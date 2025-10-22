import { Module } from '@nestjs/common';
import { DocentService } from './docent.service';
import { DocentController } from './docent.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocentEntity } from '@database/entities/docent';
import { SchoolGradeModule } from '@school-grade/school-grade.module';

@Module({
  imports: [TypeOrmModule.forFeature([DocentEntity]), SchoolGradeModule],
  controllers: [DocentController],
  providers: [DocentService],
  exports: [DocentService],
})
export class DocentModule {}
