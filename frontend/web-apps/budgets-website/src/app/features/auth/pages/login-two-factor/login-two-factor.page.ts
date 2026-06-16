import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideLockKeyhole, lucideShieldCheck } from '@ng-icons/lucide';

import { ZardButtonComponent } from '@/shared/components/button/button.component';
import { ZardInputDirective } from '@/shared/components/input/input.directive';
import { ToastService } from '@/shared/components/toast';

import { AuthStateService } from '../../../../core/auth/auth-state.service';
import { AuthShellComponent } from '../../components/auth-shell/auth-shell.component';

@Component({
  selector: 'app-login-two-factor-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule, AuthShellComponent, NgIcon, ZardButtonComponent, ZardInputDirective],
  templateUrl: './login-two-factor.page.html',
  styleUrl: './login-two-factor.page.scss',
  viewProviders: [
    provideIcons({
      lucideLockKeyhole,
      lucideShieldCheck,
    }),
  ],
})
export class LoginTwoFactorPage {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authState = inject(AuthStateService);
  private readonly toastService = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);

  protected readonly submitting = signal(false);

  protected readonly form = this.formBuilder.nonNullable.group({
    code: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]]
  });

  constructor() {
    const notice = this.authState.consumeNotice();
    if (notice) {
      queueMicrotask(() => {
        this.toastService.primary('Continue a verificacao', notice);
      });
    }

    if (!this.authState.twoFactorToken()) {
      this.authState.setNotice('Sua etapa de autenticacao expirou. Entre novamente.');
      void this.router.navigate(['/login']);
    }
  }

  submit(): void {
    if (this.form.invalid || this.submitting()) {
      this.form.markAllAsTouched();
      this.showValidationToast();
      return;
    }

    this.submitting.set(true);

    this.authState
      .completeTwoFactorLogin(this.form.getRawValue().code)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.submitting.set(false),
        error: (error: unknown) => {
          this.submitting.set(false);
          this.toastService.danger('Codigo invalido', this.extractErrorMessage(error));
        }
      });
  }

  private showValidationToast(): void {
    if (this.form.controls.code.hasError('required')) {
      this.toastService.warning('Informe o codigo', 'Digite o codigo de 6 digitos do autenticador.');
      return;
    }

    if (this.form.controls.code.hasError('pattern')) {
      this.toastService.warning('Codigo invalido', 'Use exatamente 6 digitos numericos.');
    }
  }

  private extractErrorMessage(error: unknown): string {
    if (typeof error === 'object' && error !== null && 'error' in error) {
      const apiError = error.error;
      if (typeof apiError === 'string' && apiError.trim()) {
        return apiError;
      }
    }

    return 'Nao foi possivel validar o codigo. Confira o app autenticador e tente novamente.';
  }
}
