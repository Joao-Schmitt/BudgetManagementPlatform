import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, effect, inject, input, output } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { ZardButtonComponent } from '@/shared/components/button/button.component';
import { ZardCardComponent } from '@/shared/components/card/card.component';
import { ZardInputDirective } from '@/shared/components/input/input.directive';

import { CustomerFormValue, CustomerUpsertRequest } from '../../models/customer.model';

@Component({
  selector: 'app-customer-form-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule, ZardButtonComponent, ZardCardComponent, ZardInputDirective],
  templateUrl: './customer-form-modal.component.html',
  styleUrl: './customer-form-modal.component.scss'
})
export class CustomerFormModalComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  readonly title = input.required<string>();
  readonly saving = input(false);
  readonly initialValue = input<CustomerFormValue | null>(null);
  readonly submitForm = output<CustomerUpsertRequest>();
  readonly close = output<void>();

  protected readonly form = this.formBuilder.nonNullable.group({
    nome: ['', [Validators.required, Validators.maxLength(150)]],
    documento: [''],
    email: ['', [Validators.email]],
    telefone: [''],
    whatsApp: [''],
    cep: [''],
    logradouro: [''],
    numero: [''],
    complemento: [''],
    bairro: [''],
    cidade: [''],
    uf: ['', [Validators.maxLength(2)]],
    observacao: ['']
  });

  constructor() {
    effect(() => {
      const value = this.initialValue();

      this.form.reset(value ?? this.createEmptyValue());
    });

    this.form.controls.uf.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => {
        const uppercased = value.toUpperCase();

        if (value !== uppercased) {
          this.form.controls.uf.setValue(uppercased, { emitEvent: false });
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

  protected hasError(controlName: keyof CustomerFormValue, errorName: string): boolean {
    const control = this.form.controls[controlName];
    return control.touched && control.hasError(errorName);
  }

  private buildRequest(): CustomerUpsertRequest {
    const value = this.form.getRawValue();

    return {
      nome: value.nome.trim(),
      documento: this.toOptional(value.documento),
      email: this.toOptional(value.email),
      telefone: this.toOptional(value.telefone),
      whatsApp: this.toOptional(value.whatsApp),
      cep: this.toOptional(value.cep),
      logradouro: this.toOptional(value.logradouro),
      numero: this.toOptional(value.numero),
      complemento: this.toOptional(value.complemento),
      bairro: this.toOptional(value.bairro),
      cidade: this.toOptional(value.cidade),
      uf: this.toOptional(value.uf),
      observacao: this.toOptional(value.observacao)
    };
  }

  private toOptional(value: string): string | undefined {
    const trimmed = value.trim();
    return trimmed ? trimmed : undefined;
  }

  private createEmptyValue(): CustomerFormValue {
    return {
      nome: '',
      documento: '',
      email: '',
      telefone: '',
      whatsApp: '',
      cep: '',
      logradouro: '',
      numero: '',
      complemento: '',
      bairro: '',
      cidade: '',
      uf: '',
      observacao: ''
    };
  }
}
