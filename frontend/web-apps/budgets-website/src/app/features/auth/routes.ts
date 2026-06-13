import { Routes } from '@angular/router';

export const AUTH_ROUTES: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.page').then((m) => m.LoginPage)
  },
  {
    path: 'login/two-factor',
    loadComponent: () => import('./pages/login-two-factor/login-two-factor.page').then((m) => m.LoginTwoFactorPage)
  },
  {
    path: 'create-account',
    loadComponent: () => import('./pages/create-account/create-account.page').then((m) => m.CreateAccountPage)
  },
  {
    path: 'activate-two-factor',
    loadComponent: () => import('./pages/activate-two-factor/activate-two-factor.page').then((m) => m.ActivateTwoFactorPage)
  }
];
