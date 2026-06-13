import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';

import { AuthStateService } from './auth-state.service';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const authState = inject(AuthStateService);
  const credentialedRequest = request.clone({
    withCredentials: true
  });

  return next(credentialedRequest).pipe(
    catchError((error: unknown) => {
      if (!shouldRefreshSession(error, request.url)) {
        return throwError(() => error);
      }

      return authState.refreshSession().pipe(
        switchMap(() => next(credentialedRequest)),
        catchError((refreshError: unknown) => {
          authState.handleUnauthorized();
          return throwError(() => refreshError);
        })
      );
    })
  );
};

function shouldRefreshSession(error: unknown, requestUrl: string): boolean {
  if (!(error instanceof HttpErrorResponse) || error.status !== 401) {
    return false;
  }

  const normalizedUrl = requestUrl.toLowerCase();

  return !(
    normalizedUrl.endsWith('/auth/refresh') ||
    normalizedUrl.endsWith('/auth/logout') ||
    normalizedUrl.endsWith('/auth/login') ||
    normalizedUrl.endsWith('/auth/logintwofactor') ||
    normalizedUrl.endsWith('/auth/createaccount')
  );
}
