import { Routes } from '@angular/router';
import { isLoggedGuard } from '@auth/guards/isLogged.guard';
import { notLoggedGuard } from '@auth/guards/notLogged.guard';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('@auth/auth.routes'),
    canMatch: [notLoggedGuard],
  },
  {
    path: 'dashboard',
    loadChildren: () => import('@dashboard/dashboard.routes'),
    canMatch: [isLoggedGuard],
  },
  {
    path: '**',
    redirectTo: 'auth/login',
  },
];
