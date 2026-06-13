import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { ZardAlertComponent } from '@/shared/components/alert/alert.component';
import { ZardButtonComponent } from '@/shared/components/button/button.component';
import { ZardInputDirective } from '@/shared/components/input/input.directive';

import { AuthStateService } from '../../../../core/auth/auth-state.service';
import { AuthShellComponent } from '../../components/auth-shell/auth-shell.component';

@Component({
  selector: 'app-login-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule, AuthShellComponent, ZardAlertComponent, ZardButtonComponent, ZardInputDirective],
  templateUrl: './login.page.html',
  styleUrl: './login.page.scss'
})
export class LoginPage {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authState = inject(AuthStateService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly errorMessage = signal<string | null>(null);
  protected readonly noticeMessage = signal<string | null>(this.authState.consumeNotice());
  protected readonly submitting = signal(false);

  protected readonly form = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  submit(): void {
    if (this.form.invalid || this.submitting()) {
      this.form.markAllAsTouched();
      return;
    }

    this.errorMessage.set(null);
    this.noticeMessage.set(null);
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
          this.errorMessage.set(this.extractErrorMessage(error));
        }
      });
  }

  protected hasError(controlName: 'email' | 'password', errorName: string): boolean {
    const control = this.form.controls[controlName];
    return control.touched && control.hasError(errorName);
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
