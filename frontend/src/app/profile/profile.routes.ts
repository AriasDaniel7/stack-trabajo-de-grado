import { Routes } from '@angular/router';
import { HomeLayout } from './layouts/home-layout/home-layout';

export const profileRoutes: Routes = [
  {
    path: '',
    component: HomeLayout,
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/home-page/home-page'),
      },
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];

export default profileRoutes;
