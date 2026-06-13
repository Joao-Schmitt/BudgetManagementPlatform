import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, effect, inject, input, output } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { ZardButtonComponent } from '@/shared/components/button/button.component';
import { ZardCardComponent } from '@/shared/components/card/card.component';
import { ZardInputDirective } from '@/shared/components/input/input.directive';

import { EstablishmentFormValue, EstablishmentUpsertRequest } from '../../models/establishment.model';

@Component({
  selector: 'app-establishment-form-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule, ZardButtonComponent, ZardCardComponent, ZardInputDirective],
  templateUrl: './establishment-form-modal.component.html',
  styleUrl: './establishment-form-modal.component.scss'
})
export class EstablishmentFormModalComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  readonly title = input.required<string>();
  readonly saving = input(false);
  readonly initialValue = input<EstablishmentFormValue | null>(null);
  readonly submitForm = output<EstablishmentUpsertRequest>();
  readonly close = output<void>();

  protected readonly form = this.formBuilder.nonNullable.group({
    razaoSocial: ['', [Validators.required, Validators.maxLength(180)]],
    nomeFantasia: [''],
    cnpj: [''],
    inscricaoEstadual: [''],
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
    logoUrl: ['']
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

  protected hasError(controlName: keyof EstablishmentFormValue, errorName: string): boolean {
    const control = this.form.controls[controlName];
    return control.touched && control.hasError(errorName);
  }

  private buildRequest(): EstablishmentUpsertRequest {
    const value = this.form.getRawValue();

    return {
      razaoSocial: value.razaoSocial.trim(),
      nomeFantasia: this.toOptional(value.nomeFantasia),
      cnpj: this.toOptional(value.cnpj),
      inscricaoEstadual: this.toOptional(value.inscricaoEstadual),
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
      logoUrl: this.toOptional(value.logoUrl)
    };
  }

  private toOptional(value: string): string | undefined {
    const trimmed = value.trim();
    return trimmed ? trimmed : undefined;
  }

  private createEmptyValue(): EstablishmentFormValue {
    return {
      razaoSocial: '',
      nomeFantasia: '',
      cnpj: '',
      inscricaoEstadual: '',
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
      logoUrl: ''
    };
  }
}
