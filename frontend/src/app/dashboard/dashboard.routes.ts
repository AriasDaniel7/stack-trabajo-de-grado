import { Routes } from '@angular/router';
import { DashboardLayoutComponent } from './layouts/dashboard-layout/dashboard-layout.component';
import { isAdminGuard } from '@auth/guards/isAdmin.guard';

export const dashboardRoutes: Routes = [
  {
    path: '',
    component: DashboardLayoutComponent,
    children: [
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
        path: 'users',
        canMatch: [isAdminGuard],
        loadChildren: () => import('@user/user.routes'),
      },
      {
        path: '**',
        redirectTo: 'school-grades',
      },
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];

export default dashboardRoutes;
