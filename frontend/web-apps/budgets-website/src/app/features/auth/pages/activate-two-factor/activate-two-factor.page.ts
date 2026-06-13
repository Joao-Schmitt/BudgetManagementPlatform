import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import QRCode from 'qrcode';

import { ZardAlertComponent } from '@/shared/components/alert/alert.component';
import { ZardButtonComponent } from '@/shared/components/button/button.component';
import { ZardCardComponent } from '@/shared/components/card/card.component';
import { ZardInputDirective } from '@/shared/components/input/input.directive';

import { AuthStateService } from '../../../../core/auth/auth-state.service';
import { EnableTwoFactorResponse } from '../../../../core/auth/models/auth.model';
import { AuthShellComponent } from '../../components/auth-shell/auth-shell.component';

@Component({
  selector: 'app-activate-two-factor-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule, AuthShellComponent, ZardAlertComponent, ZardButtonComponent, ZardCardComponent, ZardInputDirective],
  templateUrl: './activate-two-factor.page.html',
  styleUrl: './activate-two-factor.page.scss'
})
export class ActivateTwoFactorPage {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authState = inject(AuthStateService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);

  protected readonly step = signal<'question' | 'setup'>('question');
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly loadingSetup = signal(false);
  protected readonly submitting = signal(false);
  protected readonly setupData = signal<EnableTwoFactorResponse | null>(null);
  protected readonly qrCodeDataUrl = signal<string | null>(null);

  protected readonly form = this.formBuilder.nonNullable.group({
    code: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]]
  });

  constructor() {
    if (!this.authState.canActivateTwoFactorSetup()) {
      this.authState.setNotice('A ativacao de 2 fatores precisa ser iniciada logo apos o cadastro.');
      void this.router.navigate(['/create-account']);
    }
  }

  enableTwoFactor(): void {
    if (this.loadingSetup()) {
      return;
    }

    this.errorMessage.set(null);
    this.loadingSetup.set(true);

    this.authState
      .prepareTwoFactorSetup()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.loadingSetup.set(false);
          this.setupData.set(response);
          this.step.set('setup');
          void this.renderQrCode(response.optAuthUrl);
        },
        error: (error: unknown) => {
          this.loadingSetup.set(false);
          this.errorMessage.set(this.extractErrorMessage(error));
        }
      });
  }

  skip(): void {
    this.authState.skipTwoFactorSetup();
  }

  submitCode(): void {
    if (this.form.invalid || this.submitting()) {
      this.form.markAllAsTouched();
      return;
    }

    this.errorMessage.set(null);
    this.submitting.set(true);

    this.authState
      .confirmTwoFactorSetup(this.form.getRawValue().code)
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

  private async renderQrCode(otpAuthUrl: string): Promise<void> {
    try {
      const dataUrl = await QRCode.toDataURL(otpAuthUrl, {
        margin: 1,
        width: 220,
        color: {
          dark: '#0c141d',
          light: '#f8efe3'
        }
      });

      this.qrCodeDataUrl.set(dataUrl);
    } catch {
      this.errorMessage.set('Nao foi possivel renderizar o QR code. Use o codigo secreto abaixo.');
      this.qrCodeDataUrl.set(null);
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

    return 'Nao foi possivel concluir esta etapa agora. Tente novamente.';
  }
}
