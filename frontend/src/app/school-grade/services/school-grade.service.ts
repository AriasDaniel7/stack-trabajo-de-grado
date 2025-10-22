import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { PaginationOptions } from '@core/interfaces/pagination';
import {
  SchoolGrade,
  SchoolGradeCreate,
  SchoolGradeExistingResponse,
  SchoolGradeResponse,
} from '@core/interfaces/school-grade';
import { schoolGradeKeys } from '@core/utils/keys';
import { environment } from '@env/environment';
import { injectQuery, QueryClient } from '@tanstack/angular-query-experimental';
import { catchError, firstValueFrom, tap, throwError } from 'rxjs';

const BASE_URL = environment.apiUrl + '/school-grade';
const { LIST_KEY } = schoolGradeKeys;

@Injectable({
  providedIn: 'root',
})
export class SchoolGradeService {
  private http = inject(HttpClient);
  private queryClient = inject(QueryClient);
  private _pagination1 = signal<PaginationOptions | null>(null);
  private _pagination2 = signal<PaginationOptions | null>(null);

  pagination1 = computed(this._pagination1);
  pagination2 = computed(this._pagination2);

  schoolGQuery = injectQuery(() => ({
    queryKey: [LIST_KEY, this.pagination1()],
    queryFn: () => firstValueFrom(this.getAll(this.pagination1()!)),
    enabled: !!this.pagination1(),
  }));

  schoolGExistingQuery = injectQuery(() => ({
    queryKey: [LIST_KEY, 'existing', this.pagination2()],
    queryFn: () => firstValueFrom(this.getAllExisting(this.pagination2()!)),
    enabled: !!this.pagination2(),
  }));

  fetch(pagination?: PaginationOptions) {
    const paginationToUse = pagination ?? this.pagination1();
    return this.queryClient.fetchQuery({
      queryKey: [LIST_KEY, paginationToUse],
      queryFn: () => firstValueFrom(this.getAll(paginationToUse!)),
    });
  }

  setPagination1(pagination: PaginationOptions) {
    this._pagination1.set({ ...pagination });
  }

  setPagination2(pagination: PaginationOptions) {
    this._pagination2.set({ ...pagination });
  }

  create(body: SchoolGradeCreate) {
    return this.http.post<SchoolGrade>(`${BASE_URL}`, body, { withCredentials: true }).pipe(
      tap(() => {
        this.queryClient.invalidateQueries({ queryKey: [LIST_KEY], exact: false });
        this.queryClient.refetchQueries({ queryKey: [LIST_KEY], exact: false });
      }),
      catchError((err) => this.handleError(err))
    );
  }

  update(id: string, body: Partial<SchoolGradeCreate>) {
    return this.http.patch<SchoolGrade>(`${BASE_URL}/${id}`, body, { withCredentials: true }).pipe(
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
    return this.http.get<SchoolGradeResponse>(`${BASE_URL}/all`, {
      withCredentials: true,
      params: {
        ...pagination,
      },
    });
  }

  private getAllExisting(pagination?: PaginationOptions) {
    return this.http.get<SchoolGradeExistingResponse>(`${BASE_URL}/all-existing`, {
      withCredentials: true,
      params: { ...pagination },
    });
  }

  private handleError(err: HttpErrorResponse) {
    const message = err.error.message || 'Error desconocido';

    if (err.status === 409) {
      if (message === 'A school grade with that level already exists') {
        return throwError(() => new Error('Ya existe un grado escolar con ese nivel'));
      }

      if (message === 'A school grade with that name already exists') {
        return throwError(() => new Error('Ya existe un grado escolar con ese nombre'));
      }

      if (
        message === 'Cannot delete school grade because it is associated with one or more docents'
      ) {
        return throwError(
          () =>
            new Error(
              'No se puede eliminar el grado escolar porque está asociado a uno o más docentes'
            )
        );
      }
    }

    return throwError(() => new Error(message));
  }
}
