import { Routes } from '@angular/router';
import { HomeLayoutComponent } from './layouts/home-layout/home-layout.component';

export const feeRoutes: Routes = [
  {
    path: '',
    component: HomeLayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/home-page/home-page.component'),
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

export default feeRoutes;
