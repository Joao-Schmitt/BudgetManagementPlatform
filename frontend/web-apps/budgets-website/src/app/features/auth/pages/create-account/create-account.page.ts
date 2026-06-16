import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideLockKeyhole, lucideMail, lucideUserRound } from '@ng-icons/lucide';

import { ZardButtonComponent } from '@/shared/components/button/button.component';
import { ZardInputDirective } from '@/shared/components/input/input.directive';
import { ToastService } from '@/shared/components/toast';

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
  imports: [CommonModule, ReactiveFormsModule, AuthShellComponent, NgIcon, ZardButtonComponent, ZardInputDirective],
  templateUrl: './create-account.page.html',
  styleUrl: './create-account.page.scss',
  viewProviders: [
    provideIcons({
      lucideLockKeyhole,
      lucideMail,
      lucideUserRound,
    }),
  ],
})
export class CreateAccountPage {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authState = inject(AuthStateService);
  private readonly toastService = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);

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
      this.showValidationToast();
      return;
    }

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
          this.toastService.danger('Nao foi possivel criar a conta', this.extractErrorMessage(error));
        }
      });
  }

  private showValidationToast(): void {
    if (this.form.controls.name.hasError('required')) {
      this.toastService.warning('Informe seu nome', 'Preencha o nome para criar a conta.');
      return;
    }

    if (this.form.controls.name.hasError('minlength')) {
      this.toastService.warning('Nome muito curto', 'Use pelo menos 3 caracteres no nome.');
      return;
    }

    if (this.form.controls.email.hasError('required')) {
      this.toastService.warning('Informe o e-mail', 'Preencha o e-mail para continuar.');
      return;
    }

    if (this.form.controls.email.hasError('email')) {
      this.toastService.warning('E-mail invalido', 'Digite um e-mail valido para criar a conta.');
      return;
    }

    if (this.form.controls.password.hasError('required')) {
      this.toastService.warning('Informe uma senha', 'Crie uma senha para proteger a sua conta.');
      return;
    }

    if (this.form.controls.password.hasError('minlength')) {
      this.toastService.warning('Senha muito curta', 'Use pelo menos 6 caracteres na senha.');
      return;
    }

    if (this.form.controls.confirmPassword.hasError('required')) {
      this.toastService.warning('Confirme a senha', 'Repita a senha para finalizar o cadastro.');
      return;
    }

    if (this.form.errors?.['passwordMismatch']) {
      this.toastService.warning('Senhas diferentes', 'A confirmacao deve ser igual a senha informada.');
    }
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
