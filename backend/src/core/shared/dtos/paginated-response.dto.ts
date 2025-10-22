import { ApiProperty } from '@nestjs/swagger';
import { Type } from '@nestjs/common';

export class PaginatedResponseDto<T> {
  @ApiProperty({ type: Number })
  count: number;

  @ApiProperty({ type: Number })
  pages: number;

  data: T[];
}

export function createPaginatedResponseDto<T>(
  classRef: Type<T>,
): Type<PaginatedResponseDto<T>> {
  class PaginatedResponse extends PaginatedResponseDto<T> {
    @ApiProperty({ type: [classRef] })
    data: T[] = [];
  }

  Object.defineProperty(PaginatedResponse, 'name', {
    value: `Paginated${classRef.name}Response`,
  });

  return PaginatedResponse;
}
