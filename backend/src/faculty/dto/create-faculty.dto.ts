import { Faculty } from '@database/interfaces/data';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength } from 'class-validator';

export class CreateFacultyDto implements Faculty {
  @ApiProperty({ type: String, maxLength: 150 })
  @IsString()
  @MaxLength(150)
  name: string;
}
