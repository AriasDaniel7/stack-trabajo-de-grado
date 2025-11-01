import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Docent, DocentCreate, DocentResponse } from '@core/interfaces/docent';
import { PaginationOptions } from '@core/interfaces/pagination';
import { docentKeys } from '@core/utils/keys';
import { environment } from '@env/environment';
import { injectQuery, QueryClient } from '@tanstack/angular-query-experimental';
import { catchError, delay, firstValueFrom, tap, throwError } from 'rxjs';

const BASE_URL = environment.apiUrl + '/docent';
const { LIST_KEY } = docentKeys;

@Injectable({
  providedIn: 'root',
})
export class DocentService {
  private http = inject(HttpClient);
  private queryClient = inject(QueryClient);
  private _pagination = signal<PaginationOptions | null>(null);

  pagination = computed(this._pagination);

  docentQuery = injectQuery(() => ({
    queryKey: [LIST_KEY, this.pagination()],
    queryFn: () => firstValueFrom(this.getAll(this.pagination()!)),
    enabled: !!this.pagination(),
  }));

  create(body: DocentCreate) {
    return this.http.post<Docent>(`${BASE_URL}`, body, { withCredentials: true }).pipe(
      tap(() => {
        this.queryClient.invalidateQueries({ queryKey: [LIST_KEY], exact: false });
        this.queryClient.refetchQueries({ queryKey: [LIST_KEY], exact: false });
      }),
      catchError((err) => this.handleError(err))
    );
  }

  update(id: string, body: Partial<DocentCreate>) {
    return this.http.patch<Docent>(`${BASE_URL}/${id}`, body, { withCredentials: true }).pipe(
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

  setPagination(pagination: PaginationOptions) {
    this._pagination.set({ ...pagination });
  }

  private getAll(pagination: PaginationOptions) {
    return this.http.get<DocentResponse>(`${BASE_URL}/all`, {
      withCredentials: true,
      params: {
        ...pagination,
      },
    });
  }

  private handleError(err: HttpErrorResponse) {
    const message = err.error.message || 'Error desconocido';

    if (err.status == 409) {
      if (message === 'A docent with that document number already exists') {
        return throwError(() => new Error('Ya existe un docente con ese número de documento'));
      }
    }

    return throwError(() => new Error(message));
  }
}
