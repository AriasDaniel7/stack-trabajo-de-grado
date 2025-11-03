import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Faculty, FacultyCreate, FacultyResponse } from '@core/interfaces/faculty';
import { PaginationOptions } from '@core/interfaces/pagination';
import { facultyKeys } from '@core/utils/keys';
import { environment } from '@env/environment';
import { injectQuery, QueryClient } from '@tanstack/angular-query-experimental';
import { catchError, firstValueFrom, tap, throwError } from 'rxjs';

const BASE_URL = environment.apiUrl + '/faculty';
const { LIST_KEY } = facultyKeys;

@Injectable({
  providedIn: 'root',
})
export class FacultyService {
  private http = inject(HttpClient);
  private queryClient = inject(QueryClient);
  private _pagination = signal<PaginationOptions | null>(null);

  pagination = computed(this._pagination);

  facultyQuery = injectQuery(() => ({
    queryKey: [LIST_KEY, this.pagination()],
    queryFn: () => firstValueFrom(this.getAll(this.pagination()!)),
    enabled: !!this.pagination(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  }));

  setPagination(pagination: PaginationOptions) {
    this._pagination.set({ ...pagination });
  }

  create(body: FacultyCreate) {
    return this.http.post<Faculty>(`${BASE_URL}`, body, { withCredentials: true }).pipe(
      tap(() => {
        this.queryClient.invalidateQueries({ queryKey: [LIST_KEY], exact: false });
        this.queryClient.refetchQueries({ queryKey: [LIST_KEY], exact: false });
      }),
      catchError((err) => this.handleError(err))
    );
  }

  update(id: string, body: Partial<FacultyCreate>) {
    return this.http.patch<Faculty>(`${BASE_URL}/${id}`, body, { withCredentials: true }).pipe(
      tap(() => {
        this.queryClient.invalidateQueries({ queryKey: [LIST_KEY], exact: false });
      }),
      catchError((err) => this.handleError(err))
    );
  }

  delete(id: string) {
    return this.http.delete(`${BASE_URL}/${id}`, { withCredentials: true }).pipe(
      tap(() => {
        this.queryClient.invalidateQueries({ queryKey: [LIST_KEY], exact: false });
      }),
      catchError((err) => this.handleError(err))
    );
  }

  private getAll(pagination?: PaginationOptions) {
    return this.http.get<FacultyResponse>(`${BASE_URL}/all`, {
      withCredentials: true,
      params: {
        ...pagination,
      },
    });
  }

  private handleError(err: HttpErrorResponse) {
    const message = err.error.message || 'Error desconocido';

    if (message === 'Faculty already exists') {
      return throwError(() => new Error('La facultad ya existe'));
    }

    if (message === 'Cannot delete faculty with associated program placements.') {
      return throwError(() => new Error('No se puede eliminar la facultad porque está asociada a programas.'));
    }

    return throwError(() => new Error(message));
  }
}
