import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';

import { AuthStateService } from '../../../../core/auth/auth-state.service';
import { ActivateTwoFactorPage } from './activate-two-factor.page';

describe('ActivateTwoFactorPage', () => {
  it('should redirect when activation context is missing', () => {
    const authState = jasmine.createSpyObj<AuthStateService>(
      'AuthStateService',
      ['setNotice', 'prepareTwoFactorSetup', 'confirmTwoFactorSetup', 'skipTwoFactorSetup'],
      { canActivateTwoFactorSetup: signal(false).asReadonly() }
    );

    TestBed.configureTestingModule({
      imports: [ActivateTwoFactorPage],
      providers: [
        provideRouter([]),
        { provide: AuthStateService, useValue: authState }
      ]
    });

    const router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

    TestBed.createComponent(ActivateTwoFactorPage);

    expect(authState.setNotice).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/create-account']);
  });

  it('should load QR setup data when the user enables two factor', () => {
    const authState = jasmine.createSpyObj<AuthStateService>(
      'AuthStateService',
      ['setNotice', 'prepareTwoFactorSetup', 'confirmTwoFactorSetup', 'skipTwoFactorSetup'],
      { canActivateTwoFactorSetup: signal(true).asReadonly() }
    );
    authState.prepareTwoFactorSetup.and.returnValue(
      of({ secret: 'ABC123', optAuthUrl: 'otpauth://totp/Budgets' })
    );

    TestBed.configureTestingModule({
      imports: [ActivateTwoFactorPage],
      providers: [
        provideRouter([]),
        { provide: AuthStateService, useValue: authState }
      ]
    });

    const fixture = TestBed.createComponent(ActivateTwoFactorPage);
    const component = fixture.componentInstance;
    spyOn<any>(component, 'renderQrCode').and.returnValue(Promise.resolve());

    component.enableTwoFactor();

    expect(authState.prepareTwoFactorSetup).toHaveBeenCalled();
    expect(component['step']()).toBe('setup');
    expect(component['setupData']()?.secret).toBe('ABC123');
  });
});
