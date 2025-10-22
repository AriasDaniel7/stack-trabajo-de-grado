import { Smmlv } from '@database/interfaces/data';
import { IsNumber, IsPositive, Min } from 'class-validator';

export class CreateSmmlvDto implements Smmlv {
  @IsNumber()
  @IsPositive()
  year: number;

  @IsNumber()
  @Min(0)
  value: number;
}
