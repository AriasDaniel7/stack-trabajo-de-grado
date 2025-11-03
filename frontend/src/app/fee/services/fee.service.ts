import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Fee, FeeCreate, FeeResponse } from '@core/interfaces/fee';
import { PaginationOptions } from '@core/interfaces/pagination';
import { feeKeys } from '@core/utils/keys';
import { environment } from '@env/environment';
import { injectQuery, QueryClient } from '@tanstack/angular-query-experimental';
import { catchError, firstValueFrom, tap, throwError } from 'rxjs';

const BASE_URL = environment.apiUrl + '/fee';
const { LIST_KEY } = feeKeys;

@Injectable({
  providedIn: 'root',
})
export class FeeService {
  private http = inject(HttpClient);
  private queryClient = inject(QueryClient);
  private _pagination = signal<PaginationOptions | null>(null);

  pagination = computed(this._pagination);

  feeQuery = injectQuery(() => ({
    queryKey: [LIST_KEY, this.pagination()],
    queryFn: () => firstValueFrom(this.getAll(this.pagination()!)),
    enabled: !!this.pagination(),
  }));

  setPagination(pagination: PaginationOptions) {
    this._pagination.set({ ...pagination });
  }

  getFees(pagination: PaginationOptions) {
    return this.queryClient.ensureQueryData({
      queryKey: [LIST_KEY, pagination],
      queryFn: () => firstValueFrom(this.getAll(pagination)),
    });
  }

  create(body: FeeCreate) {
    return this.http.post<Fee>(`${BASE_URL}`, body, { withCredentials: true }).pipe(
      tap(() => {
        this.queryClient.invalidateQueries({ queryKey: [LIST_KEY], exact: false });
        this.queryClient.refetchQueries({ queryKey: [LIST_KEY], exact: false });
      }),
      catchError((err) => this.handleError(err))
    );
  }

  update(id: string, body: Partial<FeeCreate>) {
    return this.http.patch<Fee>(`${BASE_URL}/${id}`, body, { withCredentials: true }).pipe(
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
    return this.http.get<FeeResponse>(`${BASE_URL}/all`, {
      withCredentials: true,
      params: {
        ...pagination,
      },
    });
  }

  private handleError(err: HttpErrorResponse) {
    const message = err.error.message || 'Error desconocido';
    if (message === 'The rate with this modality already exists') {
      return throwError(() => new Error('La tarifa con esta modalidad ya existe'));
    }

    if (message === 'Cannot delete fee with associated program offerings.') {
      return throwError(
        () =>
          new Error('No se puede eliminar la tarifa porque está asociada a ofertas de programas.')
      );
    }
    return throwError(() => new Error(message));
  }
}
