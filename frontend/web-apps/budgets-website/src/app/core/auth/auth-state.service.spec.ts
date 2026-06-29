import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { AuthApiService } from './auth-api.service';
import { AuthStateService } from './auth-state.service';

describe('AuthStateService', () => {
  let service: AuthStateService;
  let authApi: jasmine.SpyObj<AuthApiService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(() => {
    authApi = jasmine.createSpyObj<AuthApiService>('AuthApiService', [
      'createAccount',
      'login',
      'loginTwoFactor',
      'enableTwoFactor',
      'confirmTwoFactor'
    ]);
    router = jasmine.createSpyObj<Router>('Router', ['navigate']);
    router.navigate.and.returnValue(Promise.resolve(true));

    TestBed.configureTestingModule({
      providers: [
        AuthStateService,
        { provide: AuthApiService, useValue: authApi },
        { provide: Router, useValue: router }
      ]
    });

    service = TestBed.inject(AuthStateService);
  });

  it('should complete a regular login and store the user', () => {
    authApi.login.and.returnValue(of({ id: '1', name: 'Ana', email: 'ana@empresa.com' }));

    service.login({ email: 'ana@empresa.com', password: '123456' }).subscribe();

    expect(service.isAuthenticated()).toBeTrue();
    expect(service.currentUser()).toEqual({ id: '1', name: 'Ana', email: 'ana@empresa.com' });
    expect(router.navigate).toHaveBeenCalledWith(['/home/budgets']);
  });

  it('should route to the two-factor step when required', () => {
    authApi.login.and.returnValue(of({ requiresTwoFactor: true, twoFactorToken: 'temp-token' }));

    service.login({ email: 'ana@empresa.com', password: '123456' }).subscribe();

    expect(service.isAuthenticated()).toBeFalse();
    expect(service.twoFactorToken()).toBe('temp-token');
    expect(router.navigate).toHaveBeenCalledWith(['/login/two-factor']);
  });

  it('should create the account and auto-login into activation flow', () => {
    authApi.createAccount.and.returnValue(of({ id: '1', name: 'Ana', email: 'ana@empresa.com' }));
    authApi.login.and.returnValue(of({ id: '1', name: 'Ana', email: 'ana@empresa.com' }));

    service
      .createAccount({ name: 'Ana', email: 'ana@empresa.com', password: '123456' })
      .subscribe();

    expect(service.currentUser()?.email).toBe('ana@empresa.com');
    expect(service.activationContext()).toEqual({
      email: 'ana@empresa.com',
      password: '123456'
    });
    expect(router.navigate).toHaveBeenCalledWith(['/activate-two-factor']);
  });

  it('should reset auth state after confirming two-factor setup', () => {
    authApi.confirmTwoFactor.and.returnValue(of(void 0));
    authApi.createAccount.and.returnValue(of({ id: '1', name: 'Ana', email: 'ana@empresa.com' }));
    authApi.login.and.returnValue(of({ id: '1', name: 'Ana', email: 'ana@empresa.com' }));

    service
      .createAccount({ name: 'Ana', email: 'ana@empresa.com', password: '123456' })
      .subscribe();

    service.confirmTwoFactorSetup('123456').subscribe();

    expect(service.isAuthenticated()).toBeFalse();
    expect(service.activationContext()).toBeNull();
    expect(service.consumeNotice()).toContain('Autenticacao em duas fases ativada com sucesso');
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should clear onboarding state when account creation flow fails', () => {
    authApi.createAccount.and.returnValue(of({ id: '1', name: 'Ana', email: 'ana@empresa.com' }));
    authApi.login.and.returnValue(throwError(() => new Error('Login failed')));

    service
      .createAccount({ name: 'Ana', email: 'ana@empresa.com', password: '123456' })
      .subscribe({
        error: () => undefined
      });

    expect(service.isAuthenticated()).toBeFalse();
    expect(service.activationContext()).toBeNull();
  });
});
