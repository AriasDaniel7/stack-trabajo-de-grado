import { Routes } from '@angular/router';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';

export const authRoutes: Routes = [
  {
    path: '',
    component: AuthLayoutComponent,
    children: [
      {
        path: 'login',
        loadComponent: () => import('./pages/login-page/login-page.component'),
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
