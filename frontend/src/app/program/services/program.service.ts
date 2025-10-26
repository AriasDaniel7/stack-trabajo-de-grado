import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { PaginationOptions } from '@core/interfaces/pagination';
import { PensumResponse } from '@core/interfaces/pensum';
import { ProgramCreate, ProgramResponse } from '@core/interfaces/program';
import { programKeys } from '@core/utils/keys';
import { environment } from '@env/environment';
import { ParamProgramExisting, ParamProgramPensum } from '@program/interfaces/param-program';
import { injectQuery, QueryClient } from '@tanstack/angular-query-experimental';
import { map, firstValueFrom, tap, catchError, throwError } from 'rxjs';

const BASE_URL = environment.apiUrl + '/program';
const { EXISTING_KEY, PENSUM_KEY } = programKeys;

@Injectable({
  providedIn: 'root',
})
export class ProgramService {
  private http = inject(HttpClient);
  private queryClient = inject(QueryClient);
  private _paginationExisting = signal<ParamProgramExisting | null>(null);
  private _paginationPensum = signal<ParamProgramPensum | null>(null);

  programExistingQuery = injectQuery(() => ({
    queryKey: [EXISTING_KEY, this.filterParams(this._paginationExisting())],
    queryFn: () =>
      firstValueFrom(this.getAllExisting(this.filterParams(this._paginationExisting())!)),
    enabled: !!this._paginationExisting(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  }));

  pensumQuery = injectQuery(() => ({
    queryKey: [PENSUM_KEY, this._paginationPensum()],
    queryFn: () => firstValueFrom(this.getPensumByProgramId(this._paginationPensum()!)),
    enabled: !!this._paginationPensum(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  }));

  setPaginationProgramExisting(params: ParamProgramExisting) {
    this._paginationExisting.set({ ...params });
  }

  create(body: ProgramCreate) {
    return this.http.post(`${BASE_URL}`, body, { withCredentials: true }).pipe(
      tap(() => {
        this.queryClient.invalidateQueries({ queryKey: [EXISTING_KEY], exact: false });
        this.queryClient.refetchQueries({ queryKey: [EXISTING_KEY], exact: false });
      }),
      catchError((err) => this.handleError(err))
    );
  }

  prefetchProgramExisting(params: ParamProgramExisting) {
    const filteredParams = this.filterParams(params);

    return this.queryClient.prefetchQuery({
      queryKey: [EXISTING_KEY, filteredParams],
      queryFn: () => firstValueFrom(this.getAllExisting(filteredParams!)),
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  }

  setPaginationPensumByProgramId(params?: ParamProgramPensum) {
    if (!params) {
      this._paginationPensum.set(null);
      return;
    }
    this._paginationPensum.set({ ...params });
  }

  private getAllExisting(params: ParamProgramExisting) {
    return this.http.get<ProgramResponse>(`${BASE_URL}/all`, {
      withCredentials: true,
      params: {
        ...params,
      },
    });
  }

  private getPensumByProgramId(params: ParamProgramPensum) {
    const { idProgram, ...paramRest } = params;

    return this.http
      .get<PensumResponse>(`${BASE_URL}/${idProgram}/pensum`, {
        withCredentials: true,
        params: { ...paramRest },
      })
      .pipe(
        map((response) => {
          return {
            ...response,
            data: response.data.filter((pensum) => pensum.status.toLowerCase() === 'en oferta'),
          };
        })
      );
  }

  private filterParams(params: PaginationOptions | null) {
    if (!params) return null;

    return Object.fromEntries(
      Object.entries(params).filter(
        ([_, value]) => value !== undefined && value !== null && value !== '' && value !== 'null'
      )
    );
  }

  private handleError(err: HttpErrorResponse) {
    const message = err.error.message || 'Error desconocido';

    if (message === 'Program offering already exists for the given cohort, semester, and pensum') {
      return throwError(
        () =>
          new Error(
            'Ya existe una oferta de programa para la cohorte, el semestre y el pensum dados.'
          )
      );
    }
    return throwError(() => new Error(message));
  }
}
