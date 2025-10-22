import { PaginationOptions } from '@core/interfaces/pagination';

export interface ParamSeminar extends PaginationOptions {
  name?: string;
  docent_name?: string;
  docent_document_number?: string;
  id_school_grade?: string;
}
