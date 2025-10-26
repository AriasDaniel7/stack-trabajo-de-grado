import { ApiProperty } from '@nestjs/swagger';
import { PaginationDto } from '@shared/dtos/pagination.dto';
import { Type } from 'class-transformer';
import {
  IsNumber,
  IsOptional,
  IsString,
  isUUID,
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

export function IsNumberOrUUID(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isNumberOrUUID',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (value === undefined || value === null) return true;

          // Validar si es número
          if (!isNaN(Number(value)) && value.toString().trim() !== '') {
            return true;
          }

          // Validar si es UUID (pasando la versión como segundo parámetro)
          if (typeof value === 'string' && isUUID(value, '4')) {
            return true;
          }

          return false;
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be a number or a valid UUID string`;
        },
      },
    });
  };
}

export class ParamProgramAllDto extends PaginationDto {
  @ApiProperty({
    type: Number,
    description: 'filter by educational level id',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  idEducationalLevel?: number;

  @ApiProperty({
    type: String,
    description: 'filter by modality id (number or UUID)',
    required: false,
  })
  @IsOptional()
  @IsNumberOrUUID()
  idModality?: number | string;

  @ApiProperty({
    type: String,
    description: 'filter by methodology id (number or UUID)',
    required: false,
  })
  @IsOptional()
  @IsNumberOrUUID()
  idMethodology?: number | string;

  @ApiProperty({
    type: String,
    required: false,
  })
  @IsOptional()
  @IsString()
  @Type(() => String)
  filter?: string;
}
