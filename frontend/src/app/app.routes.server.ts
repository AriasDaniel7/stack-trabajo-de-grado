import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'dashboard/programs/program-management/:idProgram/offerings',
    renderMode: RenderMode.Server,
  },
  {
    path: 'dashboard/programs/program-management/:idProgramPlacement/offerings/:idProgramOffering',
    renderMode: RenderMode.Server,
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender,
  },
];
