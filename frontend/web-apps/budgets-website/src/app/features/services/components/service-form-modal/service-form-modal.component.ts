import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, effect, inject, input, output } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { ZardButtonComponent } from '@/shared/components/button/button.component';
import { ZardCardComponent } from '@/shared/components/card/card.component';
import { ZardInputDirective } from '@/shared/components/input/input.directive';

import { ServiceFormValue, ServiceUpsertRequest } from '../../models/service.model';

@Component({
  selector: 'app-service-form-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule, ZardButtonComponent, ZardCardComponent, ZardInputDirective],
  templateUrl: './service-form-modal.component.html',
  styleUrl: './service-form-modal.component.scss'
})
export class ServiceFormModalComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  readonly title = input.required<string>();
  readonly saving = input(false);
  readonly initialValue = input<ServiceFormValue | null>(null);
  readonly submitForm = output<ServiceUpsertRequest>();
  readonly close = output<void>();

  protected readonly form = this.formBuilder.nonNullable.group({
    codigo: [''],
    nome: ['', [Validators.required, Validators.maxLength(180)]],
    descricao: [''],
    valor: ['', [Validators.required, Validators.pattern(/^\d+(?:[.,]\d{1,2})?$/)]],
    custo: ['', [Validators.pattern(/^\d*(?:[.,]\d{1,2})?$/)]]
  });

  constructor() {
    effect(() => {
      const value = this.initialValue();

      this.form.reset(value ?? this.createEmptyValue());
    });

    this.form.controls.codigo.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => {
        const trimmed = value.trimStart();

        if (value !== trimmed) {
          this.form.controls.codigo.setValue(trimmed, { emitEvent: false });
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

  protected hasError(controlName: keyof ServiceFormValue, errorName: string): boolean {
    const control = this.form.controls[controlName];
    return control.touched && control.hasError(errorName);
  }

  private buildRequest(): ServiceUpsertRequest {
    const value = this.form.getRawValue();

    return {
      codigo: this.toOptional(value.codigo),
      nome: value.nome.trim(),
      descricao: this.toOptional(value.descricao),
      valor: this.parseMoney(value.valor),
      custo: this.parseOptionalMoney(value.custo)
    };
  }

  private parseMoney(value: string): number {
    return Number(value.replace(',', '.'));
  }

  private parseOptionalMoney(value: string): number | undefined {
    const trimmed = value.trim();
    if (!trimmed) {
      return undefined;
    }

    return Number(trimmed.replace(',', '.'));
  }

  private toOptional(value: string): string | undefined {
    const trimmed = value.trim();
    return trimmed ? trimmed : undefined;
  }

  private createEmptyValue(): ServiceFormValue {
    return {
      codigo: '',
      nome: '',
      descricao: '',
      valor: '',
      custo: ''
    };
  }
}
