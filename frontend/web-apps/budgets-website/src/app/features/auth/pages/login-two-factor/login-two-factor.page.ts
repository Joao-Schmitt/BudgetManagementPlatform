import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';

import { ZardAlertComponent } from '@/shared/components/alert/alert.component';
import { ZardButtonComponent } from '@/shared/components/button/button.component';
import { ZardInputDirective } from '@/shared/components/input/input.directive';

import { AuthStateService } from '../../../../core/auth/auth-state.service';
import { AuthShellComponent } from '../../components/auth-shell/auth-shell.component';

@Component({
  selector: 'app-login-two-factor-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule, AuthShellComponent, ZardAlertComponent, ZardButtonComponent, ZardInputDirective],
  templateUrl: './login-two-factor.page.html',
  styleUrl: './login-two-factor.page.scss'
})
export class LoginTwoFactorPage {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authState = inject(AuthStateService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);

  protected readonly errorMessage = signal<string | null>(null);
  protected readonly noticeMessage = signal<string | null>(this.authState.consumeNotice());
  protected readonly submitting = signal(false);

  protected readonly form = this.formBuilder.nonNullable.group({
    code: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]]
  });

  constructor() {
    if (!this.authState.twoFactorToken()) {
      this.authState.setNotice('Sua etapa de autenticacao expirou. Entre novamente.');
      void this.router.navigate(['/login']);
    }
  }

  submit(): void {
    if (this.form.invalid || this.submitting()) {
      this.form.markAllAsTouched();
      return;
    }

    this.errorMessage.set(null);
    this.noticeMessage.set(null);
    this.submitting.set(true);

    this.authState
      .completeTwoFactorLogin(this.form.getRawValue().code)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.submitting.set(false),
        error: (error: unknown) => {
          this.submitting.set(false);
          this.errorMessage.set(this.extractErrorMessage(error));
        }
      });
  }

  protected hasCodeError(errorName: string): boolean {
    const control = this.form.controls.code;
    return control.touched && control.hasError(errorName);
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
