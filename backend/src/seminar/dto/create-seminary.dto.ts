import {
  PaymentType,
  Seminar,
  VinculationType,
} from '@database/interfaces/data';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class CreateSeminarDto implements Seminar {
  @ApiProperty({ type: Number, minimum: 0 })
  @IsOptional()
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  airTransportValue?: number;

  @ApiProperty({ type: String })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  airTransportRoute?: string;

  @ApiProperty({ type: Number, minimum: 0 })
  @IsOptional()
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  landTransportValue?: number;

  @ApiProperty({ type: String })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  landTransportRoute?: string;

  @ApiProperty({ type: Number, minimum: 0 })
  @IsOptional()
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  foodAndLodgingAid?: number;

  @ApiProperty({ type: Number, minimum: 0 })
  @IsOptional()
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  eventStayDays?: number;

  @ApiProperty({ type: String })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  hotelLocation?: string;

  @ApiProperty({ type: String, minLength: 3 })
  @IsString()
  @MinLength(3)
  @IsNotEmpty()
  name: string;

  @ApiProperty({ type: Number, minimum: 1 })
  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  credits: number;

  @ApiProperty({ type: String, format: 'uuid' })
  @IsUUID()
  @IsNotEmpty()
  docent_id: string;

  @ApiProperty({ type: String, enum: VinculationType })
  @IsEnum(VinculationType)
  @IsNotEmpty()
  docent_vinculation: VinculationType;

  @ApiProperty({ type: String, enum: PaymentType })
  @IsEnum(PaymentType)
  @IsNotEmpty()
  payment_type: PaymentType;

  @ApiProperty({ type: Boolean, default: true, required: false })
  @IsOptional()
  @IsBoolean()
  is_active: boolean;

  @ApiProperty({ type: [Date], format: 'date-time', minItems: 1 })
  @IsArray()
  @ArrayNotEmpty()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => Date)
  @IsDate({ each: true })
  dates: Date[];
}
