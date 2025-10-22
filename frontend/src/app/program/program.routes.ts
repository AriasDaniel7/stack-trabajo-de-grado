import { Routes } from '@angular/router';
import { HomeLayoutComponent } from './layouts/home-layout/home-layout.component';

export const programRoutes: Routes = [
  {
    path: '',
    component: HomeLayoutComponent,
    children: [
      {
        path: 'methodologies',
        loadChildren: () => import('@methodology/methodology.routes'),
      },
      {
        path: 'faculties',
        loadChildren: () => import('@faculty/faculty.routes'),
      },
      {
        path: 'program-management',
        loadComponent: () => import('./pages/home-page/home-page'),
      },
      {
        path: 'program-management/:id',
        loadComponent: () => import('./pages/program-detail/program-detail'),
      },
    ],
  },
];

export default programRoutes;
