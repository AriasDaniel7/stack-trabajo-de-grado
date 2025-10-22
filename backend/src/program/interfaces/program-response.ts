export interface ProgramResponse {
  content: Content[];
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

export interface Content {
  id: number;
  unidad: string;
  jornada: string;
  modalidad: string;
  metodologia: string;
  nivelEducativo: string;
  estado: string;
  nombre: string;
  codigo: string;
  facultad: null | string;
  creditos: string;
  pensum: string;
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
