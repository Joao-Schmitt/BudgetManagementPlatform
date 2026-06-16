import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideEye,
  lucideEyeOff,
  lucideLockKeyhole,
  lucideMail,
  lucideSave,
  lucideShieldCheck,
  lucideUserRound,
  lucideX
} from '@ng-icons/lucide';
import QRCode from 'qrcode';

import { ZardAlertComponent } from '@/shared/components/alert/alert.component';
import { ZardBadgeComponent } from '@/shared/components/badge/badge.component';
import { ZardButtonComponent } from '@/shared/components/button/button.component';
import { ZardCardComponent } from '@/shared/components/card/card.component';
import { ZardInputDirective } from '@/shared/components/input/input.directive';

import { AuthStateService } from '../../../../core/auth/auth-state.service';
import {
  EnableTwoFactorResponse,
  UpdateUserEmailRequest,
  UpdateUserPasswordRequest,
  UserProfile
} from '../../models/user-settings.model';
import { UserSettingsService } from '../../services/user-settings.service';

type PendingTwoFactorAction = 'email' | 'password' | 'enableTwoFactor' | 'disableTwoFactor';
type PasswordControlName = 'currentPassword' | 'newPassword' | 'confirmPassword';

@Component({
  selector: 'app-settings-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgIcon,
    ZardAlertComponent,
    ZardBadgeComponent,
    ZardButtonComponent,
    ZardCardComponent,
    ZardInputDirective
  ],
  templateUrl: './settings.page.html',
  styleUrl: './settings.page.scss',
  viewProviders: [
    provideIcons({
      lucideEye,
      lucideEyeOff,
      lucideLockKeyhole,
      lucideMail,
      lucideSave,
      lucideShieldCheck,
      lucideUserRound,
      lucideX
    })
  ]
})
export class SettingsPage {
  private readonly formBuilder = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  private readonly authState = inject(AuthStateService);
  private readonly userSettingsService = inject(UserSettingsService);

  protected readonly currentUser = this.authState.currentUser;
  protected readonly successMessage = signal<string | null>(null);
  protected readonly nameError = signal<string | null>(null);
  protected readonly emailError = signal<string | null>(null);
  protected readonly passwordError = signal<string | null>(null);
  protected readonly securityError = signal<string | null>(null);
  protected readonly twoFactorError = signal<string | null>(null);
  protected readonly savingName = signal(false);
  protected readonly savingEmail = signal(false);
  protected readonly savingPassword = signal(false);
  protected readonly enablingTwoFactor = signal(false);
  protected readonly disablingTwoFactor = signal(false);
  protected readonly submittingTwoFactor = signal(false);
  protected readonly pendingTwoFactorAction = signal<PendingTwoFactorAction | null>(null);
  protected readonly twoFactorSetupData = signal<EnableTwoFactorResponse | null>(null);
  protected readonly qrCodeDataUrl = signal<string | null>(null);
  protected readonly showCurrentPassword = signal(false);
  protected readonly showNewPassword = signal(false);
  protected readonly showConfirmPassword = signal(false);
  private readonly newPasswordValue = signal('');
  private pendingEmailRequest: UpdateUserEmailRequest | null = null;
  private pendingPasswordRequest: UpdateUserPasswordRequest | null = null;

  protected readonly nameForm = this.formBuilder.nonNullable.group({
    name: [this.currentUser()?.name ?? '', [Validators.required, Validators.maxLength(120)]]
  });

  protected readonly emailForm = this.formBuilder.nonNullable.group({
    email: [this.currentUser()?.email ?? '', [Validators.required, Validators.email, Validators.maxLength(180)]]
  });

  protected readonly passwordForm = this.formBuilder.nonNullable.group({
    currentPassword: ['', [Validators.required]],
    newPassword: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]]
  });

  protected readonly twoFactorForm = this.formBuilder.nonNullable.group({
    code: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]]
  });

  protected readonly twoFactorTitle = computed(() => {
    switch (this.pendingTwoFactorAction()) {
      case 'email':
        return 'Confirme a alteracao de e-mail';
      case 'enableTwoFactor':
        return 'Confirme a ativacao do 2FA';
      case 'disableTwoFactor':
        return 'Confirme a desativacao do 2FA';
      default:
        return 'Confirme a alteracao de senha';
    }
  });

  protected readonly isTwoFactorEnabled = computed(() => this.currentUser()?.twoFactorEnabled === true);
  protected readonly twoFactorSwitchDisabled = computed(
    () => this.enablingTwoFactor() || this.disablingTwoFactor() || this.submittingTwoFactor()
  );
  protected readonly passwordStrength = computed(() => this.evaluatePasswordStrength(this.newPasswordValue()));

  constructor() {
    this.passwordForm.controls.newPassword.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((value) => {
        this.newPasswordValue.set(value ?? '');
      });
  }

  protected saveName(): void {
    if (this.nameForm.invalid || this.savingName()) {
      this.nameForm.markAllAsTouched();
      return;
    }

    this.nameError.set(null);
    this.successMessage.set(null);
    this.savingName.set(true);

    const request = {
      name: this.nameForm.getRawValue().name.trim()
    };

    this.userSettingsService
      .updateName(request)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (user) => {
          this.savingName.set(false);
          this.applyUpdatedUser(user);
          this.successMessage.set('Nome atualizado com sucesso.');
        },
        error: (error: unknown) => {
          this.savingName.set(false);
          this.nameError.set(this.extractErrorMessage(error));
        }
      });
  }

  protected saveEmail(): void {
    if (this.emailForm.invalid || this.savingEmail()) {
      this.emailForm.markAllAsTouched();
      return;
    }

    this.emailError.set(null);
    this.successMessage.set(null);

    const request = {
      email: this.emailForm.getRawValue().email.trim()
    };

    this.submitEmail(request);
  }

  protected savePassword(): void {
    if (this.passwordForm.invalid || this.savingPassword()) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    const value = this.passwordForm.getRawValue();

    if (value.newPassword !== value.confirmPassword) {
      this.passwordForm.controls.confirmPassword.setErrors({ mismatch: true });
      this.passwordForm.controls.confirmPassword.markAsTouched();
      return;
    }

    this.passwordError.set(null);
    this.successMessage.set(null);

    this.submitPassword({
      currentPassword: value.currentPassword,
      newPassword: value.newPassword
    });
  }

  protected toggleTwoFactor(): void {
    if (this.twoFactorSwitchDisabled()) {
      return;
    }

    if (this.isTwoFactorEnabled()) {
      this.requestDisableTwoFactor();
      return;
    }

    this.requestEnableTwoFactor();
  }

  private requestEnableTwoFactor(): void {
    this.securityError.set(null);
    this.successMessage.set(null);
    this.twoFactorError.set(null);
    this.twoFactorSetupData.set(null);
    this.qrCodeDataUrl.set(null);
    this.enablingTwoFactor.set(true);

    this.userSettingsService
      .enableTwoFactor()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.enablingTwoFactor.set(false);
          this.twoFactorSetupData.set(response);
          this.pendingTwoFactorAction.set('enableTwoFactor');
          this.twoFactorForm.reset({ code: '' });
          void this.renderQrCode(response.optAuthUrl);
        },
        error: (error: unknown) => {
          this.enablingTwoFactor.set(false);
          this.securityError.set(this.extractErrorMessage(error));
        }
      });
  }

  private requestDisableTwoFactor(): void {
    this.securityError.set(null);
    this.successMessage.set(null);
    this.pendingTwoFactorAction.set('disableTwoFactor');
    this.twoFactorForm.reset({ code: '' });
  }

  protected submitTwoFactor(): void {
    if (this.twoFactorForm.invalid || this.submittingTwoFactor()) {
      this.twoFactorForm.markAllAsTouched();
      return;
    }

    const action = this.pendingTwoFactorAction();
    const code = this.twoFactorForm.getRawValue().code.trim();

    this.twoFactorError.set(null);
    this.submittingTwoFactor.set(true);

    if (action === 'email' && this.pendingEmailRequest) {
      this.submitEmail({ ...this.pendingEmailRequest, twoFactorCode: code }, true);
      return;
    }

    if (action === 'password' && this.pendingPasswordRequest) {
      this.submitPassword({ ...this.pendingPasswordRequest, twoFactorCode: code }, true);
      return;
    }

    if (action === 'enableTwoFactor') {
      this.confirmEnableTwoFactor(code);
      return;
    }

    if (action === 'disableTwoFactor') {
      this.disableTwoFactor(code);
      return;
    }

    this.submittingTwoFactor.set(false);
    this.closeTwoFactorDialog();
  }

  protected closeTwoFactorDialog(): void {
    this.pendingTwoFactorAction.set(null);
    this.pendingEmailRequest = null;
    this.pendingPasswordRequest = null;
    this.enablingTwoFactor.set(false);
    this.disablingTwoFactor.set(false);
    this.twoFactorSetupData.set(null);
    this.qrCodeDataUrl.set(null);
    this.twoFactorError.set(null);
    this.twoFactorForm.reset({ code: '' });
  }

  protected togglePasswordVisibility(controlName: PasswordControlName): void {
    switch (controlName) {
      case 'currentPassword':
        this.showCurrentPassword.update((current) => !current);
        return;
      case 'newPassword':
        this.showNewPassword.update((current) => !current);
        return;
      default:
        this.showConfirmPassword.update((current) => !current);
    }
  }

  protected passwordInputType(controlName: PasswordControlName): 'password' | 'text' {
    switch (controlName) {
      case 'currentPassword':
        return this.showCurrentPassword() ? 'text' : 'password';
      case 'newPassword':
        return this.showNewPassword() ? 'text' : 'password';
      default:
        return this.showConfirmPassword() ? 'text' : 'password';
    }
  }

  protected hasNameError(errorName: string): boolean {
    const control = this.nameForm.controls.name;
    return control.touched && control.hasError(errorName);
  }

  protected hasEmailError(errorName: string): boolean {
    const control = this.emailForm.controls.email;
    return control.touched && control.hasError(errorName);
  }

  protected hasPasswordError(controlName: PasswordControlName, errorName: string): boolean {
    const control = this.passwordForm.controls[controlName];
    return control.touched && control.hasError(errorName);
  }

  protected hasTwoFactorError(errorName: string): boolean {
    const control = this.twoFactorForm.controls.code;
    return control.touched && control.hasError(errorName);
  }

  private submitEmail(request: UpdateUserEmailRequest, hasTwoFactorCode = false): void {
    this.setEmailLoading(hasTwoFactorCode, true);

    this.userSettingsService
      .updateEmail(request)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (user) => {
          this.setEmailLoading(hasTwoFactorCode, false);
          this.applyUpdatedUser(user);
          this.emailForm.reset({ email: user.email });
          this.closeTwoFactorDialog();
          this.successMessage.set('E-mail atualizado com sucesso.');
        },
        error: (error: unknown) => {
          this.setEmailLoading(hasTwoFactorCode, false);
          this.handleSecureActionError('email', request, error, hasTwoFactorCode);
        }
      });
  }

  private submitPassword(request: UpdateUserPasswordRequest, hasTwoFactorCode = false): void {
    this.setPasswordLoading(hasTwoFactorCode, true);

    this.userSettingsService
      .updatePassword(request)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.setPasswordLoading(hasTwoFactorCode, false);
          this.passwordForm.reset({
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
          });
          this.closeTwoFactorDialog();
          this.successMessage.set('Senha atualizada com sucesso.');
        },
        error: (error: unknown) => {
          this.setPasswordLoading(hasTwoFactorCode, false);
          this.handleSecureActionError('password', request, error, hasTwoFactorCode);
        }
      });
  }

  private disableTwoFactor(code: string): void {
    this.disablingTwoFactor.set(true);

    this.userSettingsService
      .disableTwoFactor(code)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.submittingTwoFactor.set(false);
          this.disablingTwoFactor.set(false);
          this.applyTwoFactorEnabled(false);
          this.closeTwoFactorDialog();
          this.successMessage.set('Autenticacao de dois fatores desativada com sucesso.');
        },
        error: (error: unknown) => {
          this.submittingTwoFactor.set(false);
          this.disablingTwoFactor.set(false);
          this.twoFactorError.set(this.extractErrorMessage(error));
        }
      });
  }

  private confirmEnableTwoFactor(code: string): void {
    this.enablingTwoFactor.set(true);

    this.userSettingsService
      .confirmTwoFactor(code)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (user) => {
          this.submittingTwoFactor.set(false);
          this.enablingTwoFactor.set(false);

          if (user) {
            this.applyUpdatedUser({
              ...user,
              twoFactorEnabled: true
            });
          } else {
            this.applyTwoFactorEnabled(true);
          }

          this.closeTwoFactorDialog();
          this.successMessage.set('Autenticacao de dois fatores ativada com sucesso.');
        },
        error: (error: unknown) => {
          this.submittingTwoFactor.set(false);
          this.enablingTwoFactor.set(false);
          this.twoFactorError.set(this.extractErrorMessage(error));
        }
      });
  }

  private handleSecureActionError(
    action: PendingTwoFactorAction,
    request: UpdateUserEmailRequest | UpdateUserPasswordRequest,
    error: unknown,
    hasTwoFactorCode: boolean
  ): void {
    const message = this.extractErrorMessage(error);

    if (!hasTwoFactorCode && this.isTwoFactorRequiredError(message)) {
      this.pendingTwoFactorAction.set(action);
      this.twoFactorForm.reset({ code: '' });
      this.twoFactorError.set(null);

      if (action === 'email') {
        this.pendingEmailRequest = request as UpdateUserEmailRequest;
      } else {
        this.pendingPasswordRequest = request as UpdateUserPasswordRequest;
      }

      return;
    }

    if (hasTwoFactorCode) {
      this.twoFactorError.set(message);
      return;
    }

    if (action === 'email') {
      this.emailError.set(message);
      return;
    }

    this.passwordError.set(message);
  }

  private setEmailLoading(hasTwoFactorCode: boolean, loading: boolean): void {
    if (hasTwoFactorCode) {
      this.submittingTwoFactor.set(loading);
      return;
    }

    this.savingEmail.set(loading);
  }

  private setPasswordLoading(hasTwoFactorCode: boolean, loading: boolean): void {
    if (hasTwoFactorCode) {
      this.submittingTwoFactor.set(loading);
      return;
    }

    this.savingPassword.set(loading);
  }

  private applyUpdatedUser(user: UserProfile): void {
    this.authState.updateCurrentUser(user);
  }

  private applyTwoFactorEnabled(twoFactorEnabled: boolean): void {
    const currentUser = this.currentUser();

    if (!currentUser) {
      return;
    }

    this.authState.updateCurrentUser({
      ...currentUser,
      twoFactorEnabled
    });
  }

  private isTwoFactorRequiredError(message: string): boolean {
    const normalizedMessage = message.toLowerCase();

    return (
      normalizedMessage.includes('2 fatores') &&
      normalizedMessage.includes('obrigat')
    );
  }

  private async renderQrCode(otpAuthUrl: string): Promise<void> {
    try {
      const dataUrl = await QRCode.toDataURL(otpAuthUrl, {
        margin: 1,
        width: 220,
        color: {
          dark: '#0c141d',
          light: '#ffffff'
        }
      });

      this.qrCodeDataUrl.set(dataUrl);
    } catch {
      this.qrCodeDataUrl.set(null);
      this.twoFactorError.set('Nao foi possivel renderizar o QR code. Use o codigo secreto abaixo.');
    }
  }

  private extractErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      const apiError = error.error;

      if (typeof apiError === 'string' && apiError.trim()) {
        return apiError;
      }

      if (typeof apiError === 'object' && apiError !== null && 'title' in apiError) {
        const title = apiError.title;

        if (typeof title === 'string' && title.trim()) {
          return title;
        }
      }
    }

    if (error instanceof Error && error.message.trim()) {
      return error.message;
    }

    return 'Nao foi possivel salvar a alteracao agora. Tente novamente.';
  }

  private evaluatePasswordStrength(password: string): { label: string; score: number } {
    if (!password) {
      return { label: 'Fraca', score: 0 };
    }

    let score = 0;

    if (password.length >= 8) {
      score += 1;
    }

    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) {
      score += 1;
    }

    if (/\d/.test(password)) {
      score += 1;
    }

    if (/[^A-Za-z0-9]/.test(password)) {
      score += 1;
    }

    if (score <= 1) {
      return { label: 'Fraca', score: 1 };
    }

    if (score <= 3) {
      return { label: 'Media', score: 2 };
    }

    return { label: 'Forte', score: 4 };
  }
}
