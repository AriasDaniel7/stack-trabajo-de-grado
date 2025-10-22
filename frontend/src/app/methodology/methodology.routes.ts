import { Routes } from '@angular/router';

export const methodologyRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home-page/home-page.component'),
  },
  {
    path: '**',
    redirectTo: '',
  },
];

export default methodologyRoutes;
