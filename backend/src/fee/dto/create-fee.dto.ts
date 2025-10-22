import { Fee } from '@database/interfaces/data';
import { IsNumber, IsString, IsUUID, MaxLength, Min } from 'class-validator';

export class CreateFeeDto implements Fee {
  @IsString()
  @IsUUID()
  modality_id: string;

  @IsNumber()
  @Min(0)
  factor_smmlv: number;

  @IsNumber()
  @Min(0)
  credit_value_smmlv: number;
}
