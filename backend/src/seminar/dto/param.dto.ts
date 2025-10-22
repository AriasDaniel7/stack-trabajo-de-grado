import { ApiProperty } from '@nestjs/swagger';
import { PaginationDto } from '@shared/dtos/pagination.dto';
import { Type } from 'class-transformer';
import { IsOptional } from 'class-validator';

export class ParamDto extends PaginationDto {
  @ApiProperty({
    required: false,
    type: String,
    description: 'Filter by seminar name (partial match)',
  })
  @IsOptional()
  @Type(() => String)
  name?: string | undefined;

  @ApiProperty({
    required: false,
    description: 'Filter by docent name (partial match)',
    type: String,
  })
  @IsOptional()
  @Type(() => String)
  docent_name?: string | undefined;

  @ApiProperty({
    required: false,
    description: 'Filter by docent document number (exact match)',
    type: String,
  })
  @IsOptional()
  @Type(() => String)
  docent_document_number?: string | undefined;

  @ApiProperty({
    required: false,
    description: 'Filter by school grade ID (UUID format)',
    type: String,
    format: 'uuid',
  })
  @IsOptional()
  @Type(() => String)
  id_school_grade?: string | undefined;
}
