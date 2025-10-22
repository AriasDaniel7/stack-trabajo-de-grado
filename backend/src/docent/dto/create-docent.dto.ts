import { Docent, DocumentType } from '@database/interfaces/data';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateDocentDto implements Docent {
  @ApiProperty({ type: String, minLength: 2 })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  name: string;

  @ApiProperty({ type: String, minLength: 2 })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  nationality: string;

  @ApiProperty({ type: String, enum: DocumentType })
  @IsString()
  @IsNotEmpty()
  @IsEnum(DocumentType)
  document_type: DocumentType;

  @ApiProperty({ type: String, minLength: 5, maxLength: 20 })
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(20)
  @Matches(/^[0-9]+$/, { message: 'document_number must be numeric' })
  document_number: string;

  @ApiProperty({ type: String, minLength: 5 })
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  address: string;

  @ApiProperty({ type: String })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[0-9]+$/, { message: 'phone must be numeric' })
  phone: string;

  @ApiProperty({ type: String, format: 'uuid' })
  @IsUUID()
  @IsNotEmpty()
  id_school_grade: string;
}
