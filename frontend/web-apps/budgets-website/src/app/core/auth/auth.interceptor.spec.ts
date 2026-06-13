import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { authInterceptor } from './auth.interceptor';
import { AuthStateService } from './auth-state.service';

describe('authInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let authState: jasmine.SpyObj<AuthStateService>;

  beforeEach(() => {
    authState = jasmine.createSpyObj<AuthStateService>('AuthStateService', [
      'refreshSession',
      'handleUnauthorized'
    ]);

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: AuthStateService, useValue: authState }
      ]
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should refresh and retry the original request when session returns unauthorized', () => {
    authState.refreshSession.and.returnValue(of(void 0));

    http.get('/session').subscribe((response) => {
      expect(response).toEqual({ id: '1', name: 'Ana', email: 'ana@empresa.com' });
    });

    const firstRequest = httpMock.expectOne('/session');
    expect(firstRequest.request.withCredentials).toBeTrue();
    firstRequest.flush({}, { status: 401, statusText: 'Unauthorized' });

    expect(authState.refreshSession).toHaveBeenCalled();

    const retriedRequest = httpMock.expectOne('/session');
    expect(retriedRequest.request.withCredentials).toBeTrue();
    retriedRequest.flush({ id: '1', name: 'Ana', email: 'ana@empresa.com' });
  });

  it('should redirect to login when refresh fails', () => {
    authState.refreshSession.and.returnValue(
      throwError(() => ({ status: 401, statusText: 'Unauthorized' }))
    );

    http.get('/session').subscribe({
      error: () => undefined
    });

    const request = httpMock.expectOne('/session');
    request.flush({}, { status: 401, statusText: 'Unauthorized' });

    expect(authState.handleUnauthorized).toHaveBeenCalled();
  });
});
