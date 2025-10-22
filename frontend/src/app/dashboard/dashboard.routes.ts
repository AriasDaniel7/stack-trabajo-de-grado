import { Routes } from '@angular/router';
import { DashboardLayoutComponent } from './layouts/dashboard-layout/dashboard-layout.component';

export const dashboardRoutes: Routes = [
  {
    path: '',
    component: DashboardLayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/home-page/home-page.component'),
      },
      {
        path: 'school-grades',
        loadChildren: () => import('@school-grade/school-grade.routes'),
      },
      {
        path: 'docents',
        loadChildren: () => import('@docent/docent.routes'),
      },
      {
        path: 'smmlvs',
        loadChildren: () => import('@smmlv/smmlv.routes'),
      },
      {
        path: 'rates',
        loadChildren: () => import('@fee/fee.routes'),
      },
      {
        path: 'seminars',
        loadChildren: () => import('@seminar/seminar.routes'),
      },
      {
        path: 'modalities',
        loadChildren: () => import('@modality/modality.routes'),
      },
      {
        path: 'programs',
        loadChildren: () => import('@program/program.routes'),
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

export default dashboardRoutes;
