import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import {
  Methodology,
  MethodologyCreate,
  MethodologyExistingResponse,
  MethodologyResponse,
} from '@core/interfaces/methodology';
import { PaginationOptions } from '@core/interfaces/pagination';
import { methodologyKeys } from '@core/utils/keys';
import { environment } from '@env/environment';
import { injectQuery, QueryClient } from '@tanstack/angular-query-experimental';
import { catchError, delay, firstValueFrom, tap, throwError } from 'rxjs';

const BASE_URL = environment.apiUrl + '/methodology';
const { LIST_KEY } = methodologyKeys;

@Injectable({
  providedIn: 'root',
})
export class MethodologyService {
  private http = inject(HttpClient);
  private queryClient = inject(QueryClient);
  private _pagination = signal<PaginationOptions | null>(null);

  pagination = computed(this._pagination);

  methodologyQuery = injectQuery(() => ({
    queryKey: [LIST_KEY, this.pagination()],
    queryFn: () => firstValueFrom(this.getAll(this.pagination()!)),
    enabled: !!this.pagination(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  }));

  getMethodologies(pagination: PaginationOptions) {
    return this.queryClient.ensureQueryData({
      queryKey: [LIST_KEY, 'existing', pagination],
      queryFn: () => firstValueFrom(this.getAllExisting(pagination)),
    });
  }

  setPagination(pagination: PaginationOptions) {
    this._pagination.set({ ...pagination });
  }

  create(body: MethodologyCreate) {
    return this.http.post<Methodology>(`${BASE_URL}`, body, { withCredentials: true }).pipe(
      tap(() => {
        this.queryClient.invalidateQueries({ queryKey: [LIST_KEY], exact: false });
        this.queryClient.refetchQueries({ queryKey: [LIST_KEY], exact: false });
      }),
      catchError((err) => this.handleError(err))
    );
  }

  update(id: string, body: Partial<MethodologyCreate>) {
    return this.http.patch<Methodology>(`${BASE_URL}/${id}`, body, { withCredentials: true }).pipe(
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
    return this.http.get<MethodologyResponse>(`${BASE_URL}/all`, {
      withCredentials: true,
      params: {
        ...pagination,
      },
    });
  }

  private getAllExisting(pagination?: PaginationOptions) {
    return this.http.get<MethodologyExistingResponse>(`${BASE_URL}/all-existing`, {
      withCredentials: true,
      params: {
        ...pagination,
      },
    });
  }

  private handleError(err: HttpErrorResponse) {
    const message = err.error.message || 'Error desconocido';

    if (message === 'Methodology already exists') {
      return throwError(() => new Error('La metodología ya existe'));
    }

    return throwError(() => new Error(message));
  }
}
