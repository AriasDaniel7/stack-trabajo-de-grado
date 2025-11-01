import { Module } from '@nestjs/common';
import { SeminarService } from './seminar.service';
import { SeminarController } from './seminar.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeminarDateEntity } from '@database/entities/seminar-date';
import { SeminarEntity } from '@database/entities/seminar';
import { SeminarDocentEntity } from '@database/entities/seminar-docent';
import { DocentSeminarEntity } from '@database/entities/docent-seminar';
import { SchoolGradeSeminarEntity } from '@database/entities/school-grade-seminar';
import { DocentModule } from '@docent/docent.module';
import { SeminarProgramOfferingEntity } from '@database/entities/seminar-program-offering';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SeminarDateEntity,
      SeminarEntity,
      SeminarDocentEntity,
      DocentSeminarEntity,
      SchoolGradeSeminarEntity,
      SeminarProgramOfferingEntity,
    ]),
    DocentModule,
  ],
  controllers: [SeminarController],
  providers: [SeminarService],
})
export class SeminarModule {}
