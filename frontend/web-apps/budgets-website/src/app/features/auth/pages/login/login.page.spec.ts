import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';

import { AuthStateService } from '../../../../core/auth/auth-state.service';
import { LoginPage } from './login.page';

describe('LoginPage', () => {
  it('should submit valid credentials through the auth state service', () => {
    const authState = jasmine.createSpyObj<AuthStateService>('AuthStateService', ['login', 'consumeNotice']);
    authState.login.and.returnValue(of(void 0));
    authState.consumeNotice.and.returnValue(null);

    TestBed.configureTestingModule({
      imports: [LoginPage],
      providers: [
        provideRouter([]),
        { provide: AuthStateService, useValue: authState }
      ]
    });

    const fixture = TestBed.createComponent(LoginPage);
    const component = fixture.componentInstance;
    component['form'].setValue({ email: 'ana@empresa.com', password: '123456' });

    component.submit();

    expect(authState.login).toHaveBeenCalledWith({
      email: 'ana@empresa.com',
      password: '123456'
    });
  });

  it('should show api errors when login fails', () => {
    const authState = jasmine.createSpyObj<AuthStateService>('AuthStateService', ['login', 'consumeNotice']);
    authState.login.and.returnValue(throwError(() => ({ error: 'Credenciais invalidas.' })));
    authState.consumeNotice.and.returnValue(null);

    TestBed.configureTestingModule({
      imports: [LoginPage],
      providers: [
        provideRouter([]),
        { provide: AuthStateService, useValue: authState }
      ]
    });

    const fixture = TestBed.createComponent(LoginPage);
    const component = fixture.componentInstance;
    component['form'].setValue({ email: 'ana@empresa.com', password: '123456' });

    component.submit();

    expect(component['errorMessage']()).toBe('Credenciais invalidas.');
  });
});
