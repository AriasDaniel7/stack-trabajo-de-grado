import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { PasswordUpdate } from '@core/interfaces/auth';
import { PaginationOptions } from '@core/interfaces/pagination';
import { User, UserResponse } from '@core/interfaces/user';
import { userKeys } from '@core/utils/keys';
import { environment } from '@env/environment';
import { injectQuery, QueryClient } from '@tanstack/angular-query-experimental';
import { catchError, delay, firstValueFrom, of, tap, throwError } from 'rxjs';

const BASE_URL_USER = environment.apiUrl + '/user';
const { LIST_KEY, BY_ID_KEY } = userKeys;

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private http = inject(HttpClient);
  private queryClient = inject(QueryClient);
  private _pagination = signal<PaginationOptions | null>(null);

  userQuery = injectQuery(() => ({
    queryKey: [LIST_KEY, this._pagination()],
    queryFn: () => firstValueFrom(this.$getUsers(this._pagination()!)),
    enabled: !!this._pagination(),
  }));

  getUserById(id: string) {
    return this.queryClient.ensureQueryData({
      queryKey: [BY_ID_KEY, id],
      queryFn: () => firstValueFrom(this.$getByUserId(id)),
    });
  }

  updateUser(id: string, user: Partial<User>) {
    return this.http.patch<User>(`${BASE_URL_USER}/${id}`, user, { withCredentials: true }).pipe(
      tap(() => {
        this.queryClient.invalidateQueries({ queryKey: [LIST_KEY], exact: false });
        this.queryClient.refetchQueries({ queryKey: [BY_ID_KEY, id], exact: true });
      })
    );
  }

  delete(id: string) {
    return this.http
      .delete<{ message: string }>(`${BASE_URL_USER}/${id}`, { withCredentials: true })
      .pipe(
        tap(() => {
          this.queryClient.invalidateQueries({ queryKey: [LIST_KEY], exact: false });
          this.queryClient.removeQueries({ queryKey: [BY_ID_KEY, id], exact: true });
        })
      );
  }

  updatePassword(id: string, password: PasswordUpdate) {
    return this.http
      .patch<{ message: string }>(`${BASE_URL_USER}/${id}/update-password`, password, {
        withCredentials: true,
      })
      .pipe(catchError((err: HttpErrorResponse) => this.handleUpdateUser(err)));
  }

  updatePasswordByEmail(sendEmail: { email: string }) {
    return this.http
      .post<string>(`${BASE_URL_USER}/recovery-password`, sendEmail)
      .pipe(catchError((err: HttpErrorResponse) => this.handleUpdateUser(err)));
  }

  create(user: Partial<User> & { password: string }) {
    return this.http.post<User>(`${BASE_URL_USER}`, user, { withCredentials: true }).pipe(
      tap(() => {
        this.queryClient.invalidateQueries({ queryKey: [LIST_KEY], exact: false });
        this.queryClient.refetchQueries({ queryKey: [LIST_KEY], exact: false });
      })
    );
  }

  setPagination(pagination: PaginationOptions) {
    this._pagination.set({ ...pagination });
  }

  private $getByUserId(id: string) {
    return this.http
      .get<User>(`${BASE_URL_USER}/${id}`, { withCredentials: true })
      .pipe(catchError(() => of(null)));
  }

  private $getUsers(pagination?: PaginationOptions) {
    return this.http.get<UserResponse>(`${BASE_URL_USER}/all`, {
      withCredentials: true,
      params: {
        ...pagination,
      },
    });
  }

  private handleUpdateUser(err: HttpErrorResponse) {
    const message = err.error.message;

    if (message === 'Current password is incorrect') {
      return throwError(() => new Error('La contraseña actual es incorrecta'));
    }

    if (message === 'Email already exists') {
      return throwError(() => new Error('El correo electrónico ya está en uso'));
    }

    if (message === 'Error sending recovery email') {
      return throwError(() => new Error('Error al enviar el correo de recuperación'));
    }

    if (message === 'User not found') {
      return throwError(() => new Error('Correo electrónico no registrado'));
    }

    return throwError(() => new Error(message || 'Error desconocido'));
  }
}
