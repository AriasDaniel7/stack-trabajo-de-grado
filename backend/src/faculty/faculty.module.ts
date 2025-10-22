import { Module } from '@nestjs/common';
import { FacultyService } from './faculty.service';
import { FacultyController } from './faculty.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FacultyEntity } from '@database/entities/faculty';

@Module({
  imports: [TypeOrmModule.forFeature([FacultyEntity])],
  controllers: [FacultyController],
  providers: [FacultyService],
})
export class FacultyModule {}
