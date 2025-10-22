import { Methodology } from '@database/interfaces/data';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength } from 'class-validator';

export class CreateMethodologyDto implements Methodology {
  @ApiProperty({
    type: String,
    maxLength: 100,
  })
  @IsString()
  @MaxLength(100)
  name: string;
}
