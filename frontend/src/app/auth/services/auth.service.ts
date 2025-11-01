import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { AuthResponse, AuthStatus, Login } from '@core/interfaces/auth';
import { User } from '@core/interfaces/user';
import { LocalStorageService } from '@core/services/local-storage.service';
import { authKeys } from '@core/utils/keys';
import { environment } from '@env/environment';
import { QueryClient } from '@tanstack/angular-query-experimental';
import { catchError, map, of, throwError } from 'rxjs';

const BASE_URL = environment.apiUrl + '/auth';
const { STATUS_KEY, TOKEN_KEY } = authKeys;

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private queryClient = inject(QueryClient);
  private localStorage = inject(LocalStorageService);

  private _user = signal<User | null>(null);
  private _authStatus = signal<AuthStatus>('checking');
  private _token = signal<string | null>(this.localStorage.getItem(TOKEN_KEY));

  user = computed(this._user);
  token = computed(this._token);
  authStatus = computed<AuthStatus>(() => {
    if (this._authStatus() === 'checking') return 'checking';
    if (this._user()) return 'authenticated';
    return 'not-authenticated';
  });

  get authStatusCheck() {
    return this.queryClient.getQueryData<boolean>([STATUS_KEY]);
  }

  login(login: Login) {
    return this.http.post<AuthResponse>(`${BASE_URL}/login`, login, { withCredentials: true }).pipe(
      map((res) => this.handleAuthSuccess(res)),
      catchError((err) => this.handleAuthError(err))
    );
  }

  checkAuth() {
    return this.http.get<AuthResponse>(`${BASE_URL}/check-auth`, { withCredentials: true }).pipe(
      map((res) => this.handleAuthSuccess(res)),
      catchError((err) => this.handleAuthError(err))
    );
  }

  logout() {
    return of(this.handleLogout());
  }

  private handleAuthSuccess(res: AuthResponse) {
    this._user.set(res.user);
    this._authStatus.set('authenticated');
    this.queryClient.setQueryData<boolean>([STATUS_KEY], true, {
      updatedAt: Date.now() + 1000 * 60 * 60, // 1 hour
    });
    this._token.set(res.token);
    this.localStorage.setItem(TOKEN_KEY, res.token);
    return true;
  }

  private handleLogout() {
    this._user.set(null);
    this._authStatus.set('not-authenticated');
    this.queryClient.setQueryData<boolean>([STATUS_KEY], false, {
      updatedAt: Date.now(), // immediate update
    });
    this._token.set(null);
    this.localStorage.clear();
    return true;
  }

  private handleAuthError(err: HttpErrorResponse) {
    this.handleLogout();
    const message = err.error.message;

    if (message === 'Invalid email or password') {
      return throwError(() => new Error('Correo o contraseña incorrectos'));
    }

    if (message === 'User is not active') {
      return throwError(() => new Error('El usuario no está activo'));
    }

    return of(false);
  }
}
