import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideArrowRight,
  lucideChartColumn,
  lucideEye,
  lucideEyeOff,
  lucideLockKeyhole,
  lucideMail,
  lucideShieldCheck,
  lucideUsers
} from '@ng-icons/lucide';

import { ZardButtonComponent } from '@/shared/components/button/button.component';
import { ZardInputDirective } from '@/shared/components/input/input.directive';
import { ToastService } from '@/shared/components/toast';

import { AuthStateService } from '../../../../core/auth/auth-state.service';

@Component({
  selector: 'app-login-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    NgIcon,
    ZardButtonComponent,
    ZardInputDirective
  ],
  templateUrl: './login.page.html',
  styleUrl: './login.page.scss',
  viewProviders: [
    provideIcons({
      lucideArrowRight,
      lucideChartColumn,
      lucideEye,
      lucideEyeOff,
      lucideLockKeyhole,
      lucideMail,
      lucideShieldCheck,
      lucideUsers
    })
  ]
})
export class LoginPage {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authState = inject(AuthStateService);
  private readonly toastService = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly submitting = signal(false);
  protected readonly showPassword = signal(false);

  protected readonly form = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  protected togglePasswordVisibility(): void {
    this.showPassword.update((current) => !current);
  }

  constructor() {
    const notice = this.authState.consumeNotice();
    if (notice) {
      queueMicrotask(() => {
        this.toastService.success('Tudo certo', notice);
      });
    }
  }

  submit(): void {
    if (this.form.invalid || this.submitting()) {
      this.form.markAllAsTouched();
      this.showValidationToast();
      return;
    }

    this.submitting.set(true);

    const value = this.form.getRawValue();

    this.authState
      .login({
        email: value.email.trim(),
        password: value.password
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.submitting.set(false),
        error: (error: unknown) => {
          this.submitting.set(false);
          this.toastService.error('Nao foi possivel entrar', this.extractErrorMessage(error));
        }
      });
  }

  private showValidationToast(): void {
    if (this.form.controls.email.hasError('required')) {
      this.toastService.warning('Informe o e-mail', 'Preencha o campo de e-mail para continuar.');
      return;
    }

    if (this.form.controls.email.hasError('email')) {
      this.toastService.warning('E-mail invalido', 'Digite um e-mail valido para entrar.');
      return;
    }

    if (this.form.controls.password.hasError('required')) {
      this.toastService.warning('Informe a senha', 'Preencha a sua senha para continuar.');
    }
  }

  private extractErrorMessage(error: unknown): string {
    if (typeof error === 'object' && error !== null && 'error' in error) {
      const apiError = error.error;
      if (typeof apiError === 'string' && apiError.trim()) {
        return apiError;
      }
    }

    return 'Nao foi possivel entrar. Revise seus dados e tente novamente.';
  }
}
