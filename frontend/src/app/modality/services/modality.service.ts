import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import {
  Modality,
  ModalityCreate,
  ModalityExistingResponse,
  ModalityResponse,
} from '@core/interfaces/modality';
import { PaginationOptions } from '@core/interfaces/pagination';
import { modalityKeys } from '@core/utils/keys';
import { environment } from '@env/environment';
import { ParamModalityExisting } from '@modality/interfaces/param-modality-existing';
import { injectQuery, QueryClient } from '@tanstack/angular-query-experimental';
import { catchError, firstValueFrom, tap, throwError } from 'rxjs';

const BASE_URL = environment.apiUrl + '/modality';
const { LIST_KEY } = modalityKeys;

@Injectable({
  providedIn: 'root',
})
export class ModalityService {
  private http = inject(HttpClient);
  private queryClient = inject(QueryClient);
  private _pagination = signal<PaginationOptions | null>(null);
  private _paginationExisting = signal<ParamModalityExisting | null>(null);

  pagination = computed(this._pagination);
  paginationExisting = computed(this._paginationExisting);

  modalityQuery = injectQuery(() => ({
    queryKey: [LIST_KEY, this.pagination()],
    queryFn: () => firstValueFrom(this.getAll(this.pagination()!)),
    enabled: !!this.pagination(),
  }));

  modalityExistingQuery = injectQuery(() => ({
    queryKey: [LIST_KEY, 'existing', this.paginationExisting()],
    queryFn: () => firstValueFrom(this.getAllExisting(this.paginationExisting()!)),
    enabled: !!this.paginationExisting(),
  }));

  setPagination(pagination: PaginationOptions) {
    this._pagination.set({ ...pagination });
  }

  setPaginationExisting(pagination: ParamModalityExisting) {
    this._paginationExisting.set({ ...pagination });
  }

  create(body: ModalityCreate) {
    return this.http.post<Modality>(`${BASE_URL}`, body, { withCredentials: true }).pipe(
      tap(() => {
        this.queryClient.invalidateQueries({ queryKey: [LIST_KEY], exact: false });
        this.queryClient.refetchQueries({ queryKey: [LIST_KEY], exact: false });
      }),
      catchError((err) => this.handleError(err))
    );
  }

  update(id: string, body: Partial<ModalityCreate>) {
    return this.http.patch<Modality>(`${BASE_URL}/${id}`, body, { withCredentials: true }).pipe(
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
    return this.http.get<ModalityResponse>(`${BASE_URL}/all`, {
      withCredentials: true,
      params: {
        ...pagination,
      },
    });
  }

  private getAllExisting(params: ParamModalityExisting) {
    const { idEducationalLevel, ...paramsRest } = params;

    return this.http.get<ModalityExistingResponse>(
      `${BASE_URL}/all-existing/${idEducationalLevel}`,
      {
        withCredentials: true,
        params: {
          ...paramsRest,
        },
      }
    );
  }

  private handleError(err: HttpErrorResponse) {
    const message = err.error.message || 'Error desconocido';
    if (message === 'Modality already exists') {
      return throwError(() => new Error('La modalidad ya existe'));
    }

    if (message === 'The modality is associated with existing rates') {
      return throwError(() => new Error('La modalidad está asociada con tarifas existentes'));
    }

    return throwError(() => new Error(message));
  }
}
