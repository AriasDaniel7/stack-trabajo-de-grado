export enum OrderType {
  ASC = 'ASC',
  DESC = 'DESC',
}

export interface PaginationOptions {
  offset?: number; // Número de registros a omitir
  limit?: number; // Número máximo de registros a retornar
  order?: OrderType; // Orden de los registros
  q?: string; // Término de búsqueda
  name?: string; // Filtro por nombre
  year?: string; // Filtro por año
  modality_name?: string; // Filtro por nombre de modalidad
  docent_name?: string; // Filtro por nombre de docente
  docent_document_number?: string; // Filtro por número de documento de docente
  id_school_grade?: string; // Filtro por ID de grado escolar
}
