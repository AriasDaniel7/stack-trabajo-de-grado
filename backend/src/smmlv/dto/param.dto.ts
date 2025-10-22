import { ApiProperty } from '@nestjs/swagger';
import { PaginationDto } from '@shared/dtos/pagination.dto';
import { Type } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';

export class ParamDto extends PaginationDto {
  @ApiProperty({ type: String, required: false, description: 'filter by year' })
  @IsOptional()
  @IsString()
  @Type(() => String)
  year?: string;
}
