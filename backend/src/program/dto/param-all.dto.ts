import { ApiProperty } from '@nestjs/swagger';
import { PaginationDto } from '@shared/dtos/pagination.dto';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class ParamAllDto extends PaginationDto {
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
    type: Number,
    description: 'filter by modality id',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  idModality?: number;

  @ApiProperty({
    type: Number,
    description: 'filter by methodology id',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  idMethodology?: number;

  @ApiProperty({
    type: String,
    required: false,
  })
  @IsOptional()
  @IsString()
  @Type(() => String)
  filter?: string;
}
