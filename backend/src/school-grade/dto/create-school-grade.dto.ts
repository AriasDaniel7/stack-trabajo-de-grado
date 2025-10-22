import { SchoolGrade } from '@database/interfaces/data';
import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, Min } from 'class-validator';

export class CreateSchoolGradeDto implements SchoolGrade {
  @ApiProperty({ type: 'integer', minimum: 1 })
  @IsInt()
  @Min(1)
  level: number;

  @ApiProperty({ type: String })
  @IsString()
  name: string;
}
