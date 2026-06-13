import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, effect, inject, input, output } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { ZardButtonComponent } from '@/shared/components/button/button.component';
import { ZardCardComponent } from '@/shared/components/card/card.component';
import { ZardInputDirective } from '@/shared/components/input/input.directive';
import { ZardSelectImports } from '@/shared/components/select/select.imports';

import {
  VendorEstablishmentOption,
  VendorFormValue,
  VendorUpsertRequest
} from '../../models/vendor.model';

const GUID_PATTERN = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

@Component({
  selector: 'app-vendor-form-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule, ZardButtonComponent, ZardCardComponent, ZardInputDirective, ZardSelectImports],
  templateUrl: './vendor-form-modal.component.html',
  styleUrl: './vendor-form-modal.component.scss'
})
export class VendorFormModalComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  readonly title = input.required<string>();
  readonly saving = input(false);
  readonly initialValue = input<VendorFormValue | null>(null);
  readonly establishmentOptions = input<VendorEstablishmentOption[]>([]);
  readonly submitForm = output<VendorUpsertRequest>();
  readonly close = output<void>();

  protected readonly form = this.formBuilder.nonNullable.group({
    estabelecimentoId: ['', [Validators.required]],
    usuarioId: ['', [Validators.pattern(GUID_PATTERN)]],
    nome: ['', [Validators.required, Validators.maxLength(150)]],
    email: ['', [Validators.email]],
    telefone: [''],
    percentualComissaoPadrao: ['', [Validators.required, Validators.pattern(/^\d+(?:[.,]\d{1,2})?$/)]]
  });

  constructor() {
    effect(() => {
      const value = this.initialValue();
      this.form.reset(value ?? this.createEmptyValue());
    });

    this.form.controls.usuarioId.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => {
        const trimmed = value.trimStart();

        if (value !== trimmed) {
          this.form.controls.usuarioId.setValue(trimmed, { emitEvent: false });
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

  protected hasError(controlName: keyof VendorFormValue, errorName: string): boolean {
    const control = this.form.controls[controlName];
    return control.touched && control.hasError(errorName);
  }

  private buildRequest(): VendorUpsertRequest {
    const value = this.form.getRawValue();

    return {
      estabelecimentoId: value.estabelecimentoId,
      usuarioId: this.toOptional(value.usuarioId),
      nome: value.nome.trim(),
      email: this.toOptional(value.email),
      telefone: this.toOptional(value.telefone),
      percentualComissaoPadrao: this.parseMoney(value.percentualComissaoPadrao)
    };
  }

  private parseMoney(value: string): number {
    return Number(value.replace(',', '.'));
  }

  private toOptional(value: string): string | undefined {
    const trimmed = value.trim();
    return trimmed ? trimmed : undefined;
  }

  private createEmptyValue(): VendorFormValue {
    return {
      estabelecimentoId: this.establishmentOptions()[0]?.id ?? '',
      usuarioId: '',
      nome: '',
      email: '',
      telefone: '',
      percentualComissaoPadrao: ''
    };
  }
}
