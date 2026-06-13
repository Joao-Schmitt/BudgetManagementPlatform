import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { ZardAlertComponent } from '@/shared/components/alert/alert.component';
import { ZardButtonComponent } from '@/shared/components/button/button.component';
import { ZardInputDirective } from '@/shared/components/input/input.directive';

import { AuthStateService } from '../../../../core/auth/auth-state.service';
import { AuthShellComponent } from '../../components/auth-shell/auth-shell.component';

function passwordConfirmationValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;

  if (!password || !confirmPassword) {
    return null;
  }

  return password === confirmPassword ? null : { passwordMismatch: true };
}

@Component({
  selector: 'app-create-account-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule, AuthShellComponent, ZardAlertComponent, ZardButtonComponent, ZardInputDirective],
  templateUrl: './create-account.page.html',
  styleUrl: './create-account.page.scss'
})
export class CreateAccountPage {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authState = inject(AuthStateService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly errorMessage = signal<string | null>(null);
  protected readonly submitting = signal(false);

  protected readonly form = this.formBuilder.nonNullable.group(
    {
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    },
    { validators: passwordConfirmationValidator }
  );

  submit(): void {
    if (this.form.invalid || this.submitting()) {
      this.form.markAllAsTouched();
      return;
    }

    this.errorMessage.set(null);
    this.submitting.set(true);

    const value = this.form.getRawValue();

    this.authState
      .createAccount({
        name: value.name.trim(),
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

  protected hasError(controlName: 'name' | 'email' | 'password' | 'confirmPassword', errorName: string): boolean {
    const control = this.form.controls[controlName];
    return control.touched && control.hasError(errorName);
  }

  protected passwordsDoNotMatch(): boolean {
    return !!this.form.errors?.['passwordMismatch'] && this.form.touched;
  }

  private extractErrorMessage(error: unknown): string {
    if (typeof error === 'object' && error !== null && 'error' in error) {
      const apiError = error.error;
      if (typeof apiError === 'string' && apiError.trim()) {
        return apiError;
      }
    }

    if (error instanceof Error && error.message.trim()) {
      return error.message;
    }

    return 'Nao foi possivel criar a conta agora. Tente novamente.';
  }
}
