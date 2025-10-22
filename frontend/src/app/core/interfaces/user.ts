export enum Rol {
  ADMIN = 'admin',
  USER = 'user',
}

export interface User {
  id: string;
  email: string;
  name: string;
  isActive: boolean;
  role: Rol;
}
