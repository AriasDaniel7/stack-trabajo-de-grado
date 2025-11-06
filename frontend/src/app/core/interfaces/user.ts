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
  createdAt: Date;
  updatedAt: Date;
}

export interface UserUpdate {
  email: string;
  name: string;
  role: Rol;
  isActive?: boolean;
}
