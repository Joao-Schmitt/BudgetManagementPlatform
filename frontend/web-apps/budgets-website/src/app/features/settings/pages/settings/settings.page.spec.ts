import { HttpErrorResponse } from '@angular/common/http';
import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { AuthStateService } from '../../../../core/auth/auth-state.service';
import { UserSettingsService } from '../../services/user-settings.service';
import { SettingsPage } from './settings.page';

describe('SettingsPage', () => {
  it('should update the current user when the name is saved', () => {
    const authState = jasmine.createSpyObj<AuthStateService>(
      'AuthStateService',
      ['updateCurrentUser'],
      {
        currentUser: signal({ id: '1', name: 'Ana', email: 'ana@empresa.com' }).asReadonly()
      }
    );
    const userSettingsService = jasmine.createSpyObj<UserSettingsService>('UserSettingsService', [
      'updateName',
      'updateEmail',
      'updatePassword',
      'enableTwoFactor',
      'confirmTwoFactor',
      'disableTwoFactor'
    ]);
    userSettingsService.updateName.and.returnValue(of({ id: '1', name: 'Ana Silva', email: 'ana@empresa.com' }));

    TestBed.configureTestingModule({
      imports: [SettingsPage],
      providers: [
        { provide: AuthStateService, useValue: authState },
        { provide: UserSettingsService, useValue: userSettingsService }
      ]
    });

    const fixture = TestBed.createComponent(SettingsPage);
    const component = fixture.componentInstance;
    component['nameForm'].setValue({ name: 'Ana Silva' });

    component['saveName']();

    expect(userSettingsService.updateName).toHaveBeenCalledWith({ name: 'Ana Silva' });
    expect(authState.updateCurrentUser).toHaveBeenCalledWith({
      id: '1',
      name: 'Ana Silva',
      email: 'ana@empresa.com'
    });
  });

  it('should request a two factor code and retry email update through the backend', () => {
    const authState = jasmine.createSpyObj<AuthStateService>(
      'AuthStateService',
      ['updateCurrentUser'],
      {
        currentUser: signal({ id: '1', name: 'Ana', email: 'ana@empresa.com' }).asReadonly()
      }
    );
    const userSettingsService = jasmine.createSpyObj<UserSettingsService>('UserSettingsService', [
      'updateName',
      'updateEmail',
      'updatePassword',
      'enableTwoFactor',
      'confirmTwoFactor',
      'disableTwoFactor'
    ]);
    userSettingsService.updateEmail.and.returnValues(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 400,
            error: 'Código de autenticação de 2 fatores é obrigatório.'
          })
      ),
      of({ id: '1', name: 'Ana', email: 'ana.nova@empresa.com' })
    );

    TestBed.configureTestingModule({
      imports: [SettingsPage],
      providers: [
        { provide: AuthStateService, useValue: authState },
        { provide: UserSettingsService, useValue: userSettingsService }
      ]
    });

    const fixture = TestBed.createComponent(SettingsPage);
    const component = fixture.componentInstance;
    component['emailForm'].setValue({ email: 'ana.nova@empresa.com' });

    component['saveEmail']();

    expect(component['pendingTwoFactorAction']()).toBe('email');

    component['twoFactorForm'].setValue({ code: '123456' });
    component['submitTwoFactor']();

    expect(userSettingsService.updateEmail).toHaveBeenCalledWith({
      email: 'ana.nova@empresa.com',
      twoFactorCode: '123456'
    });
    expect(authState.updateCurrentUser).toHaveBeenCalledWith({
      id: '1',
      name: 'Ana',
      email: 'ana.nova@empresa.com'
    });
  });

  it('should ask for a two factor code before disabling 2FA', () => {
    const authState = jasmine.createSpyObj<AuthStateService>(
      'AuthStateService',
      ['updateCurrentUser'],
      {
        currentUser: signal({
          id: '1',
          name: 'Ana',
          email: 'ana@empresa.com',
          twoFactorEnabled: true
        }).asReadonly()
      }
    );
    const userSettingsService = jasmine.createSpyObj<UserSettingsService>('UserSettingsService', [
      'updateName',
      'updateEmail',
      'updatePassword',
      'enableTwoFactor',
      'confirmTwoFactor',
      'disableTwoFactor'
    ]);
    userSettingsService.disableTwoFactor.and.returnValue(of(void 0));

    TestBed.configureTestingModule({
      imports: [SettingsPage],
      providers: [
        { provide: AuthStateService, useValue: authState },
        { provide: UserSettingsService, useValue: userSettingsService }
      ]
    });

    const fixture = TestBed.createComponent(SettingsPage);
    const component = fixture.componentInstance;

    component['toggleTwoFactor']();

    expect(component['pendingTwoFactorAction']()).toBe('disableTwoFactor');
    expect(userSettingsService.disableTwoFactor).not.toHaveBeenCalled();

    component['twoFactorForm'].setValue({ code: '123456' });
    component['submitTwoFactor']();

    expect(userSettingsService.disableTwoFactor).toHaveBeenCalledWith('123456');
    expect(authState.updateCurrentUser).toHaveBeenCalledWith({
      id: '1',
      name: 'Ana',
      email: 'ana@empresa.com',
      twoFactorEnabled: false
    });
  });

  it('should start setup and confirm through the backend before enabling 2FA locally', () => {
    const authState = jasmine.createSpyObj<AuthStateService>(
      'AuthStateService',
      ['updateCurrentUser'],
      {
        currentUser: signal({
          id: '1',
          name: 'Ana',
          email: 'ana@empresa.com',
          twoFactorEnabled: false
        }).asReadonly()
      }
    );
    const userSettingsService = jasmine.createSpyObj<UserSettingsService>('UserSettingsService', [
      'updateName',
      'updateEmail',
      'updatePassword',
      'enableTwoFactor',
      'confirmTwoFactor',
      'disableTwoFactor'
    ]);
    userSettingsService.enableTwoFactor.and.returnValue(
      of({ secret: 'ABC123', optAuthUrl: 'otpauth://totp/Budgets' })
    );
    userSettingsService.confirmTwoFactor.and.returnValue(
      of({
        id: '1',
        name: 'Ana',
        email: 'ana@empresa.com',
        twoFactorEnabled: true
      })
    );

    TestBed.configureTestingModule({
      imports: [SettingsPage],
      providers: [
        { provide: AuthStateService, useValue: authState },
        { provide: UserSettingsService, useValue: userSettingsService }
      ]
    });

    const fixture = TestBed.createComponent(SettingsPage);
    const component = fixture.componentInstance;
    spyOn<any>(component, 'renderQrCode').and.returnValue(Promise.resolve());

    component['toggleTwoFactor']();

    expect(userSettingsService.enableTwoFactor).toHaveBeenCalled();
    expect(component['pendingTwoFactorAction']()).toBe('enableTwoFactor');
    expect(authState.updateCurrentUser).not.toHaveBeenCalled();

    component['twoFactorForm'].setValue({ code: '123456' });
    component['submitTwoFactor']();

    expect(userSettingsService.confirmTwoFactor).toHaveBeenCalledWith('123456');
    expect(authState.updateCurrentUser).toHaveBeenCalledWith({
      id: '1',
      name: 'Ana',
      email: 'ana@empresa.com',
      twoFactorEnabled: true
    });
  });
});
