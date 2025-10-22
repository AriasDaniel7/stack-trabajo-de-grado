import { Type } from 'class-transformer';
import { IsEnum, IsOptional, Min } from 'class-validator';
import { PaginationOptions } from '../interfaces/pagination';
import { ApiProperty } from '@nestjs/swagger';

export enum OrderType {
  ASC = 'ASC',
  DESC = 'DESC',
}

export class PaginationDto implements PaginationOptions {
  @ApiProperty({
    required: false,
    type: Number,
    description: 'Number of items to return',
    example: 10,
    minimum: 1,
  })
  @IsOptional()
  @Min(1)
  @Type(() => Number)
  limit?: number | undefined;

  @ApiProperty({
    required: false,
    type: Number,
    description: 'Number of items to skip',
    example: 0,
    minimum: 0,
  })
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  offset?: number | undefined;

  @ApiProperty({
    required: false,
    enum: OrderType,
    description: 'Order of the results',
    example: OrderType.ASC,
  })
  @IsOptional()
  @IsEnum(OrderType)
  order?: OrderType | undefined;
}
