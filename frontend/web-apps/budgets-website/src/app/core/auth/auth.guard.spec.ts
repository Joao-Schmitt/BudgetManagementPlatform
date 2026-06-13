import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { authGuard } from './auth.guard';
import { AuthStateService } from './auth-state.service';

describe('authGuard', () => {
  it('should allow navigation when authenticated', () => {
    const authState = jasmine.createSpyObj<AuthStateService>('AuthStateService', ['setNotice'], {
      isAuthenticated: signal(true).asReadonly()
    });
    const router = jasmine.createSpyObj<Router>('Router', ['createUrlTree']);

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthStateService, useValue: authState },
        { provide: Router, useValue: router }
      ]
    });

    const result = TestBed.runInInjectionContext(() => authGuard(null as never, null as never));
    expect(result).toBeTrue();
  });

  it('should redirect to login when unauthenticated', () => {
    const authState = jasmine.createSpyObj<AuthStateService>('AuthStateService', ['setNotice'], {
      isAuthenticated: signal(false).asReadonly(),
      sessionRestored: signal(true).asReadonly()
    });
    const expectedTree = {} as ReturnType<Router['createUrlTree']>;
    const router = jasmine.createSpyObj<Router>('Router', ['createUrlTree']);
    router.createUrlTree.and.returnValue(expectedTree);

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthStateService, useValue: authState },
        { provide: Router, useValue: router }
      ]
    });

    const result = TestBed.runInInjectionContext(() => authGuard(null as never, null as never));
    expect(authState.setNotice).toHaveBeenCalled();
    expect(router.createUrlTree).toHaveBeenCalledWith(['/login']);
    expect(result).toBe(expectedTree);
  });
});
