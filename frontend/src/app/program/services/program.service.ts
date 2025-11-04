import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { PaginationOptions } from '@core/interfaces/pagination';
import { PensumResponse } from '@core/interfaces/pensum';
import {
  Offering,
  OfferingResponse,
  Program,
  ProgramCreate,
  ProgramResponse,
} from '@core/interfaces/program';
import { programKeys } from '@core/utils/keys';
import { environment } from '@env/environment';
import {
  ParamOfferings,
  ParamPensum,
  ParamProgramAll,
  ParamProgramAllInternal,
} from '@program/interfaces/param-program';
import { injectQuery, QueryClient } from '@tanstack/angular-query-experimental';
import { firstValueFrom, tap, catchError, throwError, of } from 'rxjs';

const BASE_URL = environment.apiUrl + '/program';
const BASE_URL_DOCUMENT = environment.apiUrl + '/document';
const {
  LIST_KEY,
  BY_ID_PROGRAM_OFFERING_KEY,
  PENSUM_KEY,
  LIST_INTERNAL_KEY,
  OFFERINGS_KEY,
  BY_ID_PROGRAM_PLACEMENT_KEY,
} = programKeys;

@Injectable({
  providedIn: 'root',
})
export class ProgramService {
  private http = inject(HttpClient);
  private queryClient = inject(QueryClient);
  private _paginationAll = signal<ParamProgramAll | null>(null);
  private _pagintaionAllInternal = signal<ParamProgramAllInternal | null>(null);
  private _paginationPensum = signal<ParamPensum | null>(null);
  private _paginationOfferings = signal<ParamOfferings | null>(null);

  programAllQuery = injectQuery(() => ({
    queryKey: [LIST_KEY, this.filterParams(this._paginationAll())],
    queryFn: () => firstValueFrom(this.getAll(this.filterParams(this._paginationAll())!)),
    enabled: !!this._paginationAll(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  }));

  offeringsQuery = injectQuery(() => ({
    queryKey: [OFFERINGS_KEY, this._paginationOfferings()],
    queryFn: () =>
      firstValueFrom(this.getOfferingsByIdProgramPlacement(this._paginationOfferings()!)!),
    enabled: !!this._paginationOfferings(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  }));

  programAllInternalQuery = injectQuery(() => ({
    queryKey: [LIST_INTERNAL_KEY, this._pagintaionAllInternal()],
    queryFn: () => firstValueFrom(this.getAllInternal(this._pagintaionAllInternal()!)),
    enabled: !!this._pagintaionAllInternal(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  }));

  pensumQuery = injectQuery(() => ({
    queryKey: [PENSUM_KEY, this._paginationPensum()],
    queryFn: () => firstValueFrom(this.getPensumByProgramId(this._paginationPensum()!)),
    enabled: !!this._paginationPensum(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  }));

  programByIdPlacemenet(id: string) {
    return this.queryClient.ensureQueryData({
      queryKey: [BY_ID_PROGRAM_PLACEMENT_KEY, id],
      queryFn: () => firstValueFrom(this.findOneByIdProgramPlacement(id)),
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  }

  offeringById(id: string) {
    return this.queryClient.ensureQueryData({
      queryKey: [BY_ID_PROGRAM_OFFERING_KEY, id],
      queryFn: () => firstValueFrom(this.findOneByIdOffering(id)),
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  }

  setPaginationProgramAll(params: ParamProgramAll) {
    this._paginationAll.set({ ...params });
  }

  setPaginationProgramAllInternal(params: ParamProgramAllInternal) {
    this._pagintaionAllInternal.set({ ...params });
  }

  setPaginationOfferings(params: ParamOfferings) {
    this._paginationOfferings.set({ ...params });
  }

  create(body: ProgramCreate) {
    return this.http.post(`${BASE_URL}`, body, { withCredentials: true }).pipe(
      tap(() => {
        this.queryClient.invalidateQueries({ queryKey: [LIST_KEY], exact: false });
        this.queryClient.invalidateQueries({ queryKey: [LIST_INTERNAL_KEY], exact: false });
        this.queryClient.invalidateQueries({ queryKey: [OFFERINGS_KEY], exact: false });
        this.queryClient.refetchQueries({ queryKey: [LIST_KEY], exact: false });
        this.queryClient.refetchQueries({ queryKey: [LIST_INTERNAL_KEY], exact: false });
      }),
      catchError((err) => this.handleError(err))
    );
  }

  updateOffering(idProgramOffering: string, body: Partial<ProgramCreate>) {
    return this.http
      .patch(`${BASE_URL}/offering/${idProgramOffering}`, body, { withCredentials: true })
      .pipe(
        tap(() => {
          this.queryClient.invalidateQueries({ queryKey: [LIST_KEY], exact: false });
          this.queryClient.invalidateQueries({ queryKey: [LIST_INTERNAL_KEY], exact: false });
          this.queryClient.invalidateQueries({ queryKey: [OFFERINGS_KEY], exact: false });
          this.queryClient.invalidateQueries({
            queryKey: [BY_ID_PROGRAM_OFFERING_KEY, idProgramOffering],
            exact: true,
          });
          this.queryClient.refetchQueries({
            queryKey: [BY_ID_PROGRAM_OFFERING_KEY, idProgramOffering],
            exact: true,
          });
        }),
        catchError((err) => this.handleError(err))
      );
  }

  downloadEconomicViabilityProtocol(offeringId: string) {
    return this.http.get(
      `${BASE_URL_DOCUMENT}/offering/${offeringId}/economic-viability-protocol`,
      {
        responseType: 'blob',
      }
    );
  }

  deletePlacement(id: string) {
    return this.http.delete(`${BASE_URL}/placement/${id}`, { withCredentials: true }).pipe(
      tap(() => {
        this.queryClient.invalidateQueries({ queryKey: [LIST_INTERNAL_KEY], exact: false });
        this.queryClient.removeQueries({
          queryKey: [BY_ID_PROGRAM_PLACEMENT_KEY, id],
          exact: true,
        });
      }),
      catchError((err) => this.handleError(err))
    );
  }

  deleteOffering(idProgramOffering: string) {
    return this.http
      .delete(`${BASE_URL}/offering/${idProgramOffering}`, { withCredentials: true })
      .pipe(
        tap(() => {
          this.queryClient.invalidateQueries({ queryKey: [OFFERINGS_KEY], exact: false });
        }),
        catchError((err) => this.handleError(err))
      );
  }

  prefetchProgramAll(params: ParamProgramAll) {
    const filteredParams = this.filterParams(params);

    return this.queryClient.prefetchQuery({
      queryKey: [LIST_KEY, filteredParams],
      queryFn: () => firstValueFrom(this.getAll(filteredParams!)),
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  }

  setPaginationPensumByProgramId(params?: ParamPensum) {
    if (!params) {
      this._paginationPensum.set(null);
      return;
    }
    this._paginationPensum.set({ ...params });
  }

  private getAll(params: ParamProgramAll) {
    return this.http.get<ProgramResponse>(`${BASE_URL}/all`, {
      withCredentials: true,
      params: {
        ...params,
      },
    });
  }

  private getAllInternal(params: ParamProgramAllInternal) {
    const filteredParams = this.filterParams(params);
    return this.http.get<ProgramResponse>(`${BASE_URL}/all/internal`, {
      withCredentials: true,
      params: {
        ...filteredParams,
      },
    });
  }

  private findOneByIdOffering(idProgramOffering: string) {
    return this.http
      .get<Offering>(`${BASE_URL}/offering/${idProgramOffering}`)
      .pipe(catchError(() => of(null)));
  }

  private findOneByIdProgramPlacement(idProgramPlacement: string) {
    return this.http
      .get<Program>(`${BASE_URL}/placement/${idProgramPlacement}`, {
        withCredentials: true,
      })
      .pipe(catchError(() => of(null)));
  }

  private getOfferingsByIdProgramPlacement(params: ParamOfferings) {
    const { idProgramPlacement, ...paramRest } = params;
    return this.http.get<OfferingResponse>(
      `${BASE_URL}/placement/${idProgramPlacement}/offerings`,
      {
        withCredentials: true,
        params: {
          ...paramRest,
        },
      }
    );
  }

  private getPensumByProgramId(params: ParamPensum) {
    const { idProgram, ...paramRest } = params;

    return this.http.get<PensumResponse>(`${BASE_URL}/${idProgram}/pensum`, {
      withCredentials: true,
      params: { ...paramRest },
    });
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
