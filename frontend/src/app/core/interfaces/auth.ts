import { User } from './user';

export type AuthStatus = 'checking' | 'authenticated' | 'not-authenticated';

export interface Login {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}
