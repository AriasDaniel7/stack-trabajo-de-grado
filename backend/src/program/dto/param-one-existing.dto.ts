import { ApiProperty } from '@nestjs/swagger';
import { PaginationDto } from '@shared/dtos/pagination.dto';
import { Type } from 'class-transformer';
import { IsNumber } from 'class-validator';

export class ParamOneExistingDto extends PaginationDto {
  @ApiProperty({
    type: Number,
    description: 'Program ID',
  })
  @IsNumber()
  @Type(() => Number)
  idProgram: number;
}
