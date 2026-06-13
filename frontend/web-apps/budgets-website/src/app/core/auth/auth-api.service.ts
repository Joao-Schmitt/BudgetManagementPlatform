import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  AuthenticatedUser,
  CreateAccountRequest,
  EnableTwoFactorResponse,
  LoginRequest,
  LoginResponse,
  SessionUserResponse,
  TwoFactorLoginRequest
} from './models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthApiService {
  private readonly http = inject(HttpClient);
  private readonly authUrl = `${environment.apiUrl}/Auth`;
  private readonly sessionBaseUrl = environment.apiUrl.replace(/\/api$/, '');
  private readonly sessionAuthUrl = `${this.sessionBaseUrl}/auth`;
  private readonly sessionUrl = `${this.sessionBaseUrl}/session`;

  createAccount(request: CreateAccountRequest): Observable<AuthenticatedUser> {
    return this.http.post<AuthenticatedUser>(`${this.authUrl}/CreateAccount`, request);
  }

  login(request: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.authUrl}/Login`, request);
  }

  loginTwoFactor(request: TwoFactorLoginRequest): Observable<AuthenticatedUser> {
    return this.http.post<AuthenticatedUser>(`${this.authUrl}/LoginTwoFactor`, request);
  }

  enableTwoFactor(): Observable<EnableTwoFactorResponse> {
    return this.http.post<EnableTwoFactorResponse>(`${this.authUrl}/EnableTwoFactor`, {});
  }

  confirmTwoFactor(code: string): Observable<void> {
    const params = new HttpParams().set('code', code);

    return this.http.post<void>(`${this.authUrl}/ConfirmTwoFactor`, {}, { params });
  }

  getSession(): Observable<SessionUserResponse> {
    return this.http.get<SessionUserResponse>(this.sessionUrl);
  }

  refresh(): Observable<AuthenticatedUser> {
    return this.http.post<AuthenticatedUser>(`${this.sessionAuthUrl}/refresh`, {});
  }

  logout(): Observable<void> {
    return this.http.post<void>(`${this.sessionAuthUrl}/logout`, {});
  }
}
