import { Routes } from '@angular/router';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';
import { notLoggedGuard } from './guards/notLogged.guard';
import { isLoggedGuard } from './guards/isLogged.guard';

export const authRoutes: Routes = [
  {
    path: '',
    component: AuthLayoutComponent,
    children: [
      {
        path: 'login',
        loadComponent: () => import('./pages/login-page/login-page.component'),
        canMatch: [notLoggedGuard],
      },
      {
        path: 'profile',
        loadChildren: () => import('@profile/profile.routes'),
        canMatch: [isLoggedGuard],
      },
      {
        path: 'recovery-password',
        loadComponent: () => import('./pages/recovery-password-page/recovery-password-page')
      },
      {
        path: '**',
        redirectTo: 'login',
      },
    ],
  },

  {
    path: '**',
    redirectTo: 'login',
  },
];

export default authRoutes;
