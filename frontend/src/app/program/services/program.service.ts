import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { PaginationOptions } from '@core/interfaces/pagination';
import { PensumResponse } from '@core/interfaces/pensum';
import { ProgramExistingResponse } from '@core/interfaces/program';
import { programKeys } from '@core/utils/keys';
import { environment } from '@env/environment';
import { ParamProgramExisting, ParamProgramPensum } from '@program/interfaces/param-program';
import { injectQuery, QueryClient } from '@tanstack/angular-query-experimental';
import { firstValueFrom, map } from 'rxjs';

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
    queryKey: [EXISTING_KEY, this._paginationExisting()],
    queryFn: () => firstValueFrom(this.getAllExisting(this._paginationExisting()!)),
    enabled: !!this._paginationExisting(),
  }));

  pensumQuery = injectQuery(() => ({
    queryKey: [PENSUM_KEY, this._paginationPensum()],
    queryFn: () => firstValueFrom(this.getPensumByProgramId(this._paginationPensum()!)),
    enabled: !!this._paginationPensum(),
  }));

  setPaginationProgramExisting(params: ParamProgramExisting) {
    this._paginationExisting.set({ ...params });
  }

  setPaginationPensumByProgramId(params?: ParamProgramPensum) {
    if (!params) {
      this._paginationPensum.set(null);
      return;
    }
    this._paginationPensum.set({ ...params });
  }

  private getAllExisting(params: ParamProgramExisting) {
    const filteredParams = Object.entries(params).filter(([_, value]) => value !== undefined);

    return this.http.get<ProgramExistingResponse>(`${BASE_URL}/all-existing`, {
      withCredentials: true,
      params: {
        ...Object.fromEntries(filteredParams),
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
}
