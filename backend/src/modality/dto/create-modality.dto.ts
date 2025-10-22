import { Modality } from '@database/interfaces/data';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class CreateModalityDto implements Modality {
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  name: string;
}
