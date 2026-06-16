import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../../environments/environment';
import { UserSettingsService } from './user-settings.service';

describe('UserSettingsService', () => {
  let service: UserSettingsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UserSettingsService, provideHttpClient(), provideHttpClientTesting()]
    });

    service = TestBed.inject(UserSettingsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should update the user name through the Usuario endpoint', () => {
    service.updateName({ name: 'Ana Silva' }).subscribe();

    const request = httpMock.expectOne(`${environment.apiUrl}/Usuario/UpdateName`);
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual({ name: 'Ana Silva' });

    request.flush({ id: '1', name: 'Ana Silva', email: 'ana@empresa.com' });
  });

  it('should update the user email with an optional two factor code', () => {
    service.updateEmail({ email: 'ana.nova@empresa.com', twoFactorCode: '123456' }).subscribe();

    const request = httpMock.expectOne(`${environment.apiUrl}/Usuario/UpdateEmail`);
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual({
      email: 'ana.nova@empresa.com',
      twoFactorCode: '123456'
    });

    request.flush({ id: '1', name: 'Ana', email: 'ana.nova@empresa.com' });
  });

  it('should update the user password with an optional two factor code', () => {
    service
      .updatePassword({
        currentPassword: 'senha-atual',
        newPassword: 'nova-senha',
        twoFactorCode: '123456'
      })
      .subscribe();

    const request = httpMock.expectOne(`${environment.apiUrl}/Usuario/UpdatePassword`);
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual({
      currentPassword: 'senha-atual',
      newPassword: 'nova-senha',
      twoFactorCode: '123456'
    });

    request.flush({});
  });

  it('should start two factor setup through the Auth endpoint', () => {
    service.enableTwoFactor().subscribe();

    const request = httpMock.expectOne(`${environment.apiUrl}/Auth/EnableTwoFactor`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({});

    request.flush({ secret: 'ABC123', optAuthUrl: 'otpauth://totp/Budgets' });
  });

  it('should confirm two factor setup with a code', () => {
    service.confirmTwoFactor('123456').subscribe();

    const request = httpMock.expectOne(`${environment.apiUrl}/Auth/ConfirmTwoFactor?code=123456`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({});

    request.flush({ id: '1', name: 'Ana', email: 'ana@empresa.com', twoFactorEnabled: true });
  });

  it('should disable two factor through the Auth endpoint with a code', () => {
    service.disableTwoFactor('123456').subscribe();

    const request = httpMock.expectOne(`${environment.apiUrl}/Auth/DisableTwoFactor?code=123456`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({});

    request.flush({});
  });
});
