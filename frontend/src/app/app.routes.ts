import { Routes } from '@angular/router';
import { isLoggedGuard } from '@auth/guards/isLogged.guard';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('@auth/auth.routes'),
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
