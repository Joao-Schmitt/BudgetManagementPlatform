import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';

import { AuthStateService } from '../../../../core/auth/auth-state.service';
import { LoginTwoFactorPage } from './login-two-factor.page';

describe('LoginTwoFactorPage', () => {
  it('should redirect to login when there is no temporary token', () => {
    const authState = jasmine.createSpyObj<AuthStateService>(
      'AuthStateService',
      ['consumeNotice', 'setNotice', 'completeTwoFactorLogin'],
      { twoFactorToken: signal<string | null>(null).asReadonly() }
    );
    authState.consumeNotice.and.returnValue(null);

    TestBed.configureTestingModule({
      imports: [LoginTwoFactorPage],
      providers: [
        provideRouter([]),
        { provide: AuthStateService, useValue: authState }
      ]
    });

    const router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

    TestBed.createComponent(LoginTwoFactorPage);

    expect(authState.setNotice).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should submit the authenticator code', () => {
    const authState = jasmine.createSpyObj<AuthStateService>(
      'AuthStateService',
      ['consumeNotice', 'setNotice', 'completeTwoFactorLogin'],
      { twoFactorToken: signal<string | null>('temp-token').asReadonly() }
    );
    authState.consumeNotice.and.returnValue(null);
    authState.completeTwoFactorLogin.and.returnValue(of(void 0));

    TestBed.configureTestingModule({
      imports: [LoginTwoFactorPage],
      providers: [
        provideRouter([]),
        { provide: AuthStateService, useValue: authState }
      ]
    });

    const fixture = TestBed.createComponent(LoginTwoFactorPage);
    const component = fixture.componentInstance;
    component['form'].setValue({ code: '123456' });

    component.submit();

    expect(authState.completeTwoFactorLogin).toHaveBeenCalledWith('123456');
  });
});
