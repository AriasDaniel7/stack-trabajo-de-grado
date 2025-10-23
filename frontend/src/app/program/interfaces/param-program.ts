import { PaginationOptions } from '@core/interfaces/pagination';

export interface ParamProgramExisting extends PaginationOptions {
  idEducationalLevel?: number;
  idModality?: number;
  idMethodology?: number;
  filter?: string;
}

export interface ParamProgramPensum extends PaginationOptions {
  idProgram?: number;
}
