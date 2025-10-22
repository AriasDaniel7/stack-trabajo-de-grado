import { Routes } from '@angular/router';

export const facultyRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home-page/home-page.component'),
  },
];

export default facultyRoutes;
