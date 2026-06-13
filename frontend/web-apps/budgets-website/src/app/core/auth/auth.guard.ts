import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { from, map } from 'rxjs';

import { AuthStateService } from './auth-state.service';

export const authGuard: CanActivateFn = () => {
  const authState = inject(AuthStateService);
  const router = inject(Router);

  if (authState.isAuthenticated()) {
    return true;
  }

  if (!authState.sessionRestored()) {
    return from(authState.restoreSession()).pipe(
      map(() => {
        if (authState.isAuthenticated()) {
          return true;
        }

        authState.setNotice('Sua sessao expirou. Entre novamente para continuar.');
        return router.createUrlTree(['/login']);
      })
    );
  }

  authState.setNotice('Sua sessao expirou. Entre novamente para continuar.');
  return router.createUrlTree(['/login']);
};
