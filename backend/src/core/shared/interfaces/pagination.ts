export interface PaginationOptions {
  offset?: number; // Número de registros a omitir
  limit?: number; // Número máximo de registros a retornar
  order?: 'ASC' | 'DESC'; // Orden de los registros
  q?: string; // Término de búsqueda
}
