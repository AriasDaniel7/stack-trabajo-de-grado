import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { PaginationOptions } from '@core/interfaces/pagination';
import { Smmlv, SmmlvCreate, SmmlvResponse } from '@core/interfaces/smmlv';
import { smmlvKeys } from '@core/utils/keys';
import { environment } from '@env/environment';
import { injectQuery, QueryClient } from '@tanstack/angular-query-experimental';
import { catchError, firstValueFrom, tap, throwError } from 'rxjs';

const BASE_URL = environment.apiUrl + '/smmlv';
const { LIST_KEY } = smmlvKeys;

@Injectable({
  providedIn: 'root',
})
export class SmmlvService {
  private http = inject(HttpClient);
  private queryClient = inject(QueryClient);
  private _pagination = signal<PaginationOptions | null>(null);

  pagination = computed(this._pagination);

  smmlvQuery = injectQuery(() => ({
    queryKey: [LIST_KEY, this.pagination()],
    queryFn: () => firstValueFrom(this.getAll(this.pagination()!)),
    enabled: !!this.pagination(),
  }));

  setPagination(pagination: PaginationOptions) {
    this._pagination.set({ ...pagination });
  }

  getSmmlvs(pagination: PaginationOptions) {
    return this.queryClient.ensureQueryData({
      queryKey: [LIST_KEY, pagination],
      queryFn: () => firstValueFrom(this.getAll(pagination)),
    });
  }

  create(body: SmmlvCreate) {
    return this.http.post<Smmlv>(`${BASE_URL}`, body, { withCredentials: true }).pipe(
      tap(() => {
        this.queryClient.invalidateQueries({ queryKey: [LIST_KEY], exact: false });
        this.queryClient.refetchQueries({ queryKey: [LIST_KEY], exact: false });
      }),
      catchError((err) => this.handleError(err))
    );
  }

  update(id: string, body: Partial<SmmlvCreate>) {
    return this.http.patch<Smmlv>(`${BASE_URL}/${id}`, body, { withCredentials: true }).pipe(
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
    return this.http.get<SmmlvResponse>(`${BASE_URL}/all`, {
      withCredentials: true,
      params: {
        ...pagination,
      },
    });
  }

  private handleError(err: HttpErrorResponse) {
    const message = err.error.message || 'Error desconocido';
    if (message === 'The year already exists') {
      return throwError(() => new Error('El año ya existe'));
    }

    return throwError(() => new Error(message));
  }
}
