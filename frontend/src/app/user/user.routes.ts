import { Routes } from '@angular/router';
import { HomeLayout } from './layouts/home-layout/home-layout';

export const userRoutes: Routes = [
  {
    path: '',
    component: HomeLayout,
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/home-page/home-page'),
      },
      {
        path: ':id',
        loadComponent: () => import('./pages/user-detail-page/user-detail-page'),
      },
      {
        path: '**',
        redirectTo: '',
      },
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];

export default userRoutes;
