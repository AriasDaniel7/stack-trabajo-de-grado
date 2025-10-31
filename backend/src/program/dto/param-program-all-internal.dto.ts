import { ApiProperty } from '@nestjs/swagger';
import { PaginationDto } from '@shared/dtos/pagination.dto';
import { IsOptional, IsString, IsUUID } from 'class-validator';

export class ParamProgramAllInternalDto extends PaginationDto {
  @ApiProperty({
    type: String,
    description: 'filter by modality id (UUID)',
    format: 'uuid',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  idModality?: string;

  @ApiProperty({
    type: String,
    description: 'filter by methodology id (UUID)',
    required: false,
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  idMethodology?: string;

  @ApiProperty({
    type: String,
    description: 'filter by faculty id (UUID)',
    required: false,
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  idFaculty?: string;

  @ApiProperty({
    type: String,
    description: 'filter by program name',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    type: String,
    description: 'filter by program unity',
    required: false,
  })
  @IsOptional()
  @IsString()
  unity?: string;

  @ApiProperty({
    type: String,
    description: 'filter by program workday',
    required: false,
  })
  @IsOptional()
  @IsString()
  workday?: string;
}
