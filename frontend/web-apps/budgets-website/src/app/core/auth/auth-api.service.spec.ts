import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { environment } from '../../../environments/environment';
import { AuthApiService } from './auth-api.service';
import { authInterceptor } from './auth.interceptor';

describe('AuthApiService', () => {
  let service: AuthApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthApiService,
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(AuthApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should post login payload with credentials enabled', () => {
    service.login({ email: 'ana@empresa.com', password: '123456' }).subscribe();

    const request = httpMock.expectOne(`${environment.apiUrl}/Auth/Login`);
    expect(request.request.method).toBe('POST');
    expect(request.request.withCredentials).toBeTrue();
    expect(request.request.body).toEqual({
      email: 'ana@empresa.com',
      password: '123456'
    });

    request.flush({ id: '1', name: 'Ana', email: 'ana@empresa.com' });
  });

  it('should send query string when confirming two factor', () => {
    service.confirmTwoFactor('123456').subscribe();

    const request = httpMock.expectOne(
      `${environment.apiUrl}/Auth/ConfirmTwoFactor?code=123456`
    );
    expect(request.request.method).toBe('POST');
    expect(request.request.withCredentials).toBeTrue();

    request.flush({});
  });

  it('should post refresh with credentials enabled', () => {
    service.refresh().subscribe();

    const request = httpMock.expectOne(`${environment.apiUrl.replace(/\/api$/, '')}/auth/refresh`);
    expect(request.request.method).toBe('POST');
    expect(request.request.withCredentials).toBeTrue();
    expect(request.request.body).toEqual({});

    request.flush({ id: '1', name: 'Ana', email: 'ana@empresa.com' });
  });

  it('should post logout with credentials enabled', () => {
    service.logout().subscribe();

    const request = httpMock.expectOne(`${environment.apiUrl.replace(/\/api$/, '')}/auth/logout`);
    expect(request.request.method).toBe('POST');
    expect(request.request.withCredentials).toBeTrue();
    expect(request.request.body).toEqual({});

    request.flush({});
  });
});
