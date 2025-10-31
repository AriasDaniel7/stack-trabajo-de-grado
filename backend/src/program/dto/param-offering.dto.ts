import { ApiProperty } from '@nestjs/swagger';
import { PaginationDto } from '@shared/dtos/pagination.dto';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional } from 'class-validator';

export class ParamOfferingDto extends PaginationDto {
  @ApiProperty({
    type: Number,
    description: 'filter by cohort',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  cohort?: number;

  @ApiProperty({
    type: Number,
    description: 'filter by semester',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  semester?: number;
}
