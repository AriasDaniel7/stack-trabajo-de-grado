import { AuthModule } from '@auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from '@user/user.module';
import { SchoolGradeModule } from '@school-grade/school-grade.module';
import { DocentModule } from '@docent/docent.module';
import { SmmlvModule } from '@smmlv/smmlv.module';
import { FeeModule } from '@fee/fee.module';
import { SeminarModule } from '@seminar/seminar.module';
import { ModalityModule } from '@modality/modality.module';
import { MethodologyModule } from '@methodology/methodology.module';
import { FacultyModule } from '@faculty/faculty.module';
import { ProgramModule } from '@program/program.module';
import { DocumentModule } from './document/document.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    DatabaseModule,
    AuthModule,
    UserModule,
    SchoolGradeModule,
    DocentModule,
    SmmlvModule,
    FeeModule,
    ModalityModule,
    MethodologyModule,
    FacultyModule,
    ProgramModule,
    SeminarModule,
    DocumentModule,
  ],
})
export class AppModule {}
