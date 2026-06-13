import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, effect, inject, input, output } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { ZardButtonComponent } from '@/shared/components/button/button.component';
import { ZardCardComponent } from '@/shared/components/card/card.component';
import { ZardInputDirective } from '@/shared/components/input/input.directive';

import { PaymentMethodFormValue, PaymentMethodUpsertRequest } from '../../models/payment-method.model';

@Component({
  selector: 'app-payment-method-form-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule, ZardButtonComponent, ZardCardComponent, ZardInputDirective],
  templateUrl: './payment-method-form-modal.component.html',
  styleUrl: './payment-method-form-modal.component.scss'
})
export class PaymentMethodFormModalComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  readonly title = input.required<string>();
  readonly saving = input(false);
  readonly initialValue = input<PaymentMethodFormValue | null>(null);
  readonly submitForm = output<PaymentMethodUpsertRequest>();
  readonly close = output<void>();

  protected readonly form = this.formBuilder.nonNullable.group({
    nome: ['', [Validators.required, Validators.maxLength(120)]],
    tipo: ['', [Validators.required, Validators.maxLength(80)]]
  });

  constructor() {
    effect(() => {
      const value = this.initialValue();

      this.form.reset(value ?? this.createEmptyValue());
    });

    this.form.controls.tipo.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => {
        const trimmed = value.trimStart();

        if (value !== trimmed) {
          this.form.controls.tipo.setValue(trimmed, { emitEvent: false });
        }
      });
  }

  protected save(): void {
    if (this.form.invalid || this.saving()) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitForm.emit(this.buildRequest());
  }

  protected hasError(controlName: keyof PaymentMethodFormValue, errorName: string): boolean {
    const control = this.form.controls[controlName];
    return control.touched && control.hasError(errorName);
  }

  private buildRequest(): PaymentMethodUpsertRequest {
    const value = this.form.getRawValue();

    return {
      nome: value.nome.trim(),
      tipo: value.tipo.trim()
    };
  }

  private createEmptyValue(): PaymentMethodFormValue {
    return {
      nome: '',
      tipo: ''
    };
  }
}
