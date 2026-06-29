import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, finalize, firstValueFrom, map, Observable, of, shareReplay, switchMap, tap, throwError } from 'rxjs';

import { AuthApiService } from './auth-api.service';
import {
  ActivationContext,
  AuthenticatedUser,
  CreateAccountRequest,
  EnableTwoFactorResponse,
  LoginRequest,
  LoginResponse,
  TwoFactorRequiredResponse
} from './models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthStateService {
  private static readonly currentUserStorageKey = 'budgets.currentUser';

  private readonly authApi = inject(AuthApiService);
  private readonly router = inject(Router);

  private readonly currentUserSignal = signal<AuthenticatedUser | null>(null);
  private readonly twoFactorTokenSignal = signal<string | null>(null);
  private readonly activationContextSignal = signal<ActivationContext | null>(null);
  private readonly noticeSignal = signal<string | null>(null);
  private restoreSessionPromise: Promise<void> | null = null;
  private refreshSessionRequest: Observable<void> | null = null;
  private readonly sessionRestoredSignal = signal(false);

  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly twoFactorToken = this.twoFactorTokenSignal.asReadonly();
  readonly activationContext = this.activationContextSignal.asReadonly();
  readonly notice = this.noticeSignal.asReadonly();
  readonly isAuthenticated = computed(() => this.currentUserSignal() !== null);
  readonly sessionRestored = this.sessionRestoredSignal.asReadonly();
  readonly canActivateTwoFactorSetup = computed(
    () => this.activationContextSignal() !== null && this.currentUserSignal() !== null
  );

  setNotice(message: string | null): void {
    this.noticeSignal.set(message);
  }

  consumeNotice(): string | null {
    const currentNotice = this.noticeSignal();
    this.noticeSignal.set(null);

    return currentNotice;
  }

  clearTransientState(): void {
    this.noticeSignal.set(null);
    this.twoFactorTokenSignal.set(null);
  }

  updateCurrentUser(user: AuthenticatedUser): void {
    this.currentUserSignal.set(user);
  }

  restoreSession(): Promise<void> {
    if (this.restoreSessionPromise) {
      return this.restoreSessionPromise;
    }

    this.restoreSessionPromise = firstValueFrom(
      this.authApi.getSession().pipe(
        tap((response) => {
          this.currentUserSignal.set({
            id: response.id,
            name: response.name,
            email: response.email,
            twoFactorEnabled: response.twoFactorEnabled
          });
          this.twoFactorTokenSignal.set(null);
          this.activationContextSignal.set(null);
          this.noticeSignal.set(null);
        }),
        map(() => void 0),
        catchError(() => {
          this.resetSession();
          this.activationContextSignal.set(null);
          return of(void 0);
        })
      )
    ).finally(() => {
      this.sessionRestoredSignal.set(true);
    });

    return this.restoreSessionPromise;
  }

  refreshSession(): Observable<void> {
    if (this.refreshSessionRequest) {
      return this.refreshSessionRequest;
    }

    this.refreshSessionRequest = this.authApi.refresh().pipe(
      tap((user) => {
        this.currentUserSignal.set(user);
        this.twoFactorTokenSignal.set(null);
        this.activationContextSignal.set(null);
        this.noticeSignal.set(null);
        this.sessionRestoredSignal.set(true);
      }),
      map(() => void 0),
      catchError((error) => {
        this.resetSession();
        this.activationContextSignal.set(null);
        return throwError(() => error);
      }),
      finalize(() => {
        this.refreshSessionRequest = null;
      }),
      shareReplay({ bufferSize: 1, refCount: false })
    );

    return this.refreshSessionRequest;
  }

  createAccount(request: CreateAccountRequest): Observable<void> {
    return this.authApi.createAccount(request).pipe(
      switchMap(() => {
        this.activationContextSignal.set({
          email: request.email,
          password: request.password
        });

        return this.authApi.login({
          email: request.email,
          password: request.password
        });
      }),
      tap((response) => {
        if (this.isTwoFactorRequired(response)) {
          throw new Error('Nao foi possivel iniciar a ativacao de 2 fatores para a nova conta.');
        }

        this.currentUserSignal.set(response);
        this.twoFactorTokenSignal.set(null);
        this.noticeSignal.set(null);
        void this.router.navigate(['/activate-two-factor']);
      }),
      map(() => void 0),
      catchError((error) => {
        this.resetSession();
        this.activationContextSignal.set(null);
        return throwError(() => error);
      })
    );
  }

  login(request: LoginRequest): Observable<void> {
    return this.authApi.login(request).pipe(
      tap((response) => {
        this.noticeSignal.set(null);

        if (this.isTwoFactorRequired(response)) {
          this.currentUserSignal.set(null);
          this.activationContextSignal.set(null);
          this.twoFactorTokenSignal.set(response.twoFactorToken);
          void this.router.navigate(['/login/two-factor']);
          return;
        }

        this.currentUserSignal.set(response);
        this.twoFactorTokenSignal.set(null);
        this.activationContextSignal.set(null);
        void this.navigateToHome();
      }),
      map(() => void 0)
    );
  }

  completeTwoFactorLogin(code: string): Observable<void> {
    const token = this.twoFactorTokenSignal();

    if (!token) {
      this.setNotice('Sua etapa de autenticacao em duas fases expirou. Entre novamente.');
      void this.router.navigate(['/login']);
      return throwError(() => new Error('Two-factor token is missing.'));
    }

    return this.authApi
      .loginTwoFactor({
        twoFactorToken: token,
        code
      })
      .pipe(
        tap((user) => {
          this.currentUserSignal.set(user);
          this.twoFactorTokenSignal.set(null);
          this.noticeSignal.set(null);
          void this.navigateToHome();
        }),
        map(() => void 0)
      );
  }

  prepareTwoFactorSetup(): Observable<EnableTwoFactorResponse> {
    if (!this.canActivateTwoFactorSetup()) {
      this.setNotice('Nao foi possivel continuar a ativacao. Crie a conta novamente.');
      void this.router.navigate(['/create-account']);
      return throwError(() => new Error('Activation context is missing.'));
    }

    return this.authApi.enableTwoFactor();
  }

  confirmTwoFactorSetup(code: string): Observable<void> {
    return this.authApi.confirmTwoFactor(code).pipe(
      tap(() => {
        this.resetSession();
        this.activationContextSignal.set(null);
        this.noticeSignal.set('Autenticacao em duas fases ativada com sucesso. Entre novamente.');
        void this.router.navigate(['/login']);
      })
    );
  }

  skipTwoFactorSetup(): void {
    this.resetSession();
    this.activationContextSignal.set(null);
    this.noticeSignal.set('Conta criada com sucesso. Agora faca seu login.');
    void this.router.navigate(['/login']);
  }

  logout(): void {
    this.authApi
      .logout()
      .pipe(catchError(() => of(void 0)))
      .subscribe(() => {
        this.resetSession();
        this.activationContextSignal.set(null);
        this.noticeSignal.set('Sessao encerrada. Entre novamente para continuar.');
        void this.router.navigate(['/login']);
      });
  }

  handleUnauthorized(): void {
    this.resetSession();
    this.activationContextSignal.set(null);
    this.noticeSignal.set('Sua sessao expirou. Entre novamente para continuar.');
    void this.router.navigate(['/login']);
  }

  private resetSession(): void {
    this.currentUserSignal.set(null);
    this.twoFactorTokenSignal.set(null);
  }

  private isTwoFactorRequired(response: LoginResponse): response is TwoFactorRequiredResponse {
    return 'requiresTwoFactor' in response;
  }

  private navigateToHome(): Promise<boolean> {
    return this.router.navigate(['/home/budgets']);
  }
}
