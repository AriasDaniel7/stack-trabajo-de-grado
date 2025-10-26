import { PaginationOptions } from '@core/interfaces/pagination';

export interface ParamProgramExisting extends PaginationOptions {
  idEducationalLevel?: number;
  idModality?: number | string;
  idMethodology?: number | string;
  filter?: string;
}

export interface ParamProgramPensum extends PaginationOptions {
  idProgram?: number | string;
}
