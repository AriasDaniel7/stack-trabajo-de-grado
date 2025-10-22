import { PartialType } from '@nestjs/swagger';
import { CreateSchoolGradeDto } from './create-school-grade.dto';

export class UpdateSchoolGradeDto extends PartialType(CreateSchoolGradeDto) {}
