export interface PensumResponse {
  content: PensumExternal[];
  pageable: Pageable;
  last: boolean;
  totalPages: number;
  totalElements: number;
  first: boolean;
  size: number;
  number: number;
  sort: Sort;
  numberOfElements: number;
  empty: boolean;
}

export interface PensumExternal {
  estadoPensum: string;
  id: number;
  anoInicio: string;
  descripcion: string;
  idEstadoPensum: number;
  periodoInicio: string;
  creditos: string;
}

export interface Pageable {
  pageNumber: number;
  pageSize: number;
  sort: Sort;
  offset: number;
  paged: boolean;
  unpaged: boolean;
}

export interface Sort {
  empty: boolean;
  sorted: boolean;
  unsorted: boolean;
}
