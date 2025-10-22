import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { ProgramExistingResponse } from '@core/interfaces/program';
import { programKeys } from '@core/utils/keys';
import { environment } from '@env/environment';
import { ParamProgramExisting } from '@program/interfaces/param-program';
import { injectQuery, QueryClient } from '@tanstack/angular-query-experimental';
import { firstValueFrom } from 'rxjs';

const BASE_URL = environment.apiUrl + '/program';
const { EXISTING_KEY } = programKeys;

@Injectable({
  providedIn: 'root',
})
export class ProgramService {
  private http = inject(HttpClient);
  private queryClient = inject(QueryClient);
  private _paginationExisting = signal<ParamProgramExisting | null>(null);

  programExistingQuery = injectQuery(() => ({
    queryKey: [EXISTING_KEY, this._paginationExisting()],
    queryFn: () => firstValueFrom(this.getAllExisting(this._paginationExisting()!)),
    enabled: !!this._paginationExisting(),
  }));

  setPaginationExisting(params: ParamProgramExisting) {
    this._paginationExisting.set({ ...params });
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
}
