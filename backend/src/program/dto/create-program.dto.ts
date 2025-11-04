import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import {
  DiscountCreate,
  PensumCreate,
  ProgramCreate,
  ProgramOfferingCreate,
  SeminarProgramOfferingCreate,
} from '../interfaces/program';

export class CreatePensumDto implements PensumCreate {
  @IsOptional()
  @IsNumber()
  @IsNotEmpty()
  idPensumExternal?: number;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @IsNotEmpty()
  startYear: number;

  @IsString()
  @IsNotEmpty()
  status: string;

  @IsNumber()
  @IsNotEmpty()
  credits: number;
}

export class CreateDiscountDto implements DiscountCreate {
  @IsNumber()
  @IsNotEmpty()
  percentage: number;

  @IsNumber()
  @IsNotEmpty()
  numberOfApplicants: number;
}

export class CreateProgramOfferingDto implements ProgramOfferingCreate {
  @IsNumber()
  @IsNotEmpty()
  cohort: number;

  @IsNumber()
  @IsNotEmpty()
  semester: number;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  codeCDP?: string;
}

export class CreateSeminarProgramOfferingDto
  implements SeminarProgramOfferingCreate
{
  @IsString()
  @IsUUID()
  @IsNotEmpty()
  idSeminar: string;
}

export class CreateProgramDto implements ProgramCreate {
  @IsOptional()
  @IsNumber()
  @IsNotEmpty()
  idProgramExternal?: number;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  faculty?: string;

  @IsString()
  @IsNotEmpty()
  modality: string;

  @IsString()
  @IsNotEmpty()
  methodology: string;

  @IsString()
  @IsNotEmpty()
  unity: string;

  @IsString()
  @IsNotEmpty()
  workday: string;

  @IsString()
  @IsUUID()
  @IsNotEmpty()
  idSmmlv: string;

  @IsString()
  @IsUUID()
  @IsNotEmpty()
  idDocent: string;

  @IsString()
  @IsUUID()
  @IsNotEmpty()
  idFee: string;

  @IsObject()
  @ValidateNested()
  @Type(() => CreateProgramOfferingDto)
  @IsNotEmpty()
  programOffering: CreateProgramOfferingDto;

  @IsObject()
  @ValidateNested()
  @Type(() => CreatePensumDto)
  @IsNotEmpty()
  pensum: CreatePensumDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateDiscountDto)
  @IsNotEmpty()
  discounts: CreateDiscountDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSeminarProgramOfferingDto)
  @ArrayNotEmpty()
  seminars: CreateSeminarProgramOfferingDto[];
}
