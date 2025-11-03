import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Seminar, SeminarCreate, SeminarResponse } from '@core/interfaces/seminar';
import { seminarKeys } from '@core/utils/keys';
import { environment } from '@env/environment';
import { ParamSeminar } from '@seminar/interfaces/param';
import { injectQuery, QueryClient } from '@tanstack/angular-query-experimental';
import { catchError, firstValueFrom, tap, throwError } from 'rxjs';

const BASE_URL = environment.apiUrl + '/seminar';
const { LIST_KEY } = seminarKeys;

@Injectable({
  providedIn: 'root',
})
export class SeminarService {
  private http = inject(HttpClient);
  private queryClient = inject(QueryClient);
  private _pagination = signal<ParamSeminar | null>(null);

  pagination = computed(this._pagination);

  seminarQuery = injectQuery(() => ({
    queryKey: [LIST_KEY, this.pagination()],
    queryFn: () => firstValueFrom(this.getAll(this.pagination()!)),
    enabled: !!this.pagination(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  }));

  setPagination(params: ParamSeminar) {
    this._pagination.set({ ...params });
  }

  create(body: SeminarCreate) {
    return this.http.post<Seminar>(`${BASE_URL}`, body, { withCredentials: true }).pipe(
      tap(() => {
        this.queryClient.invalidateQueries({ queryKey: [LIST_KEY], exact: false });
        this.queryClient.refetchQueries({ queryKey: [LIST_KEY], exact: false });
      }),
      catchError((err) => this.handleError(err))
    );
  }

  update(id: string, body: Partial<SeminarCreate>) {
    return this.http.patch<Seminar>(`${BASE_URL}/${id}`, body, { withCredentials: true }).pipe(
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

  private getAll(params?: ParamSeminar) {
    return this.http.get<SeminarResponse>(`${BASE_URL}/all`, {
      withCredentials: true,
      params: {
        ...params,
      },
    });
  }

  private handleError(err: HttpErrorResponse) {
    const message = err.error.message || 'Error desconocido';

    if (err.status == 409) {
      if (message === 'Seminary with that name already exists') {
        return throwError(() => new Error('Ya existe un seminario con ese nombre'));
      }
    }

    if (message === 'Cannot delete seminar with associated program offerings.') {
      return throwError(
        () =>
          new Error(
            'No se puede eliminar el seminario porque está asociado a ofertas de programas.'
          )
      );
    }

    return throwError(() => new Error(message));
  }
}
