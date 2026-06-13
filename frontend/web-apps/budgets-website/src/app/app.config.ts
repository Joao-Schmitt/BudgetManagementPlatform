import { ApplicationConfig, inject, provideAppInitializer, provideZoneChangeDetection } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter, withEnabledBlockingInitialNavigation } from '@angular/router';

import { authInterceptor } from './core/auth/auth.interceptor';
import { AuthStateService } from './core/auth/auth-state.service';
import { routes } from './app.routes';
import { provideZard } from './shared/core/provider/providezard';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideZard(),
    provideRouter(routes, withEnabledBlockingInitialNavigation()),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideAppInitializer(async () => {
      await inject(AuthStateService).restoreSession();
    })
  ]
};
