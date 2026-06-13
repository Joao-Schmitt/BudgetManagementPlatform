import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'login'
  },
  {
    path: '',
    loadChildren: () => import('./features/auth/routes').then((m) => m.AUTH_ROUTES)
  },
  {
    path: 'home',
    loadChildren: () => import('./features/home/routes').then((m) => m.HOME_ROUTES)
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];
