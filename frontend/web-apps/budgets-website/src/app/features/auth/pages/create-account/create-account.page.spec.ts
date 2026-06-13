import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { AuthStateService } from '../../../../core/auth/auth-state.service';
import { CreateAccountPage } from './create-account.page';

describe('CreateAccountPage', () => {
  it('should block submission when passwords do not match', () => {
    const authState = jasmine.createSpyObj<AuthStateService>('AuthStateService', ['createAccount']);

    TestBed.configureTestingModule({
      imports: [CreateAccountPage],
      providers: [
        provideRouter([]),
        { provide: AuthStateService, useValue: authState }
      ]
    });

    const fixture = TestBed.createComponent(CreateAccountPage);
    const component = fixture.componentInstance;
    component['form'].setValue({
      name: 'Ana',
      email: 'ana@empresa.com',
      password: '123456',
      confirmPassword: '654321'
    });

    component.submit();

    expect(authState.createAccount).not.toHaveBeenCalled();
  });

  it('should submit a valid signup payload', () => {
    const authState = jasmine.createSpyObj<AuthStateService>('AuthStateService', ['createAccount']);
    authState.createAccount.and.returnValue(of(void 0));

    TestBed.configureTestingModule({
      imports: [CreateAccountPage],
      providers: [
        provideRouter([]),
        { provide: AuthStateService, useValue: authState }
      ]
    });

    const fixture = TestBed.createComponent(CreateAccountPage);
    const component = fixture.componentInstance;
    component['form'].setValue({
      name: 'Ana Silva',
      email: 'ana@empresa.com',
      password: '123456',
      confirmPassword: '123456'
    });

    component.submit();

    expect(authState.createAccount).toHaveBeenCalledWith({
      name: 'Ana Silva',
      email: 'ana@empresa.com',
      password: '123456'
    });
  });
});
