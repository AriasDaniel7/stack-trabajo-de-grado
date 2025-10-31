import { PaginationOptions } from '@core/interfaces/pagination';

export interface ParamProgramAll extends PaginationOptions {
  idEducationalLevel?: number;
  idModality?: number | string;
  idMethodology?: number | string;
  filter?: string;
}

export interface ParamPensum extends PaginationOptions {
  idProgram?: number | string;
}

export interface ParamProgramAllInternal extends PaginationOptions {
  idModality?: string;
  idMethodology?: string;
  idFaculty?: string;
  name?: string;
  unity?: string;
  workday?: string;
}

export interface ParamOfferings extends PaginationOptions {
  idProgramPlacement: string;
}
