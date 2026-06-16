import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  inject,
  input,
  output,
  signal
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucidePlus, lucideTrash2 } from '@ng-icons/lucide';

import { ZardButtonComponent } from '@/shared/components/button/button.component';
import { ZardCardComponent } from '@/shared/components/card/card.component';
import { ZardInputDirective } from '@/shared/components/input/input.directive';
import { ZardSelectImports } from '@/shared/components/select/select.imports';

import {
  BudgetFormSubmit,
  BudgetFormValue,
  BudgetItemFormValue,
  BudgetItemOption,
  BudgetItemType,
  BudgetOptionItem
} from '../../models/budget.model';

@Component({
  selector: 'app-budget-form-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgIcon,
    ZardButtonComponent,
    ZardCardComponent,
    ZardInputDirective,
    ZardSelectImports
  ],
  templateUrl: './budget-form-modal.component.html',
  styleUrl: './budget-form-modal.component.scss',
  viewProviders: [provideIcons({ lucidePlus, lucideTrash2 })]
})
export class BudgetFormModalComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  readonly title = input.required<string>();
  readonly saving = input(false);
  readonly initialValue = input<BudgetFormValue | null>(null);
  readonly establishmentOptions = input<BudgetOptionItem[]>([]);
  readonly customerOptions = input<BudgetOptionItem[]>([]);
  readonly vendorOptions = input<BudgetOptionItem[]>([]);
  readonly templateOptions = input<BudgetOptionItem[]>([]);
  readonly paymentMethodOptions = input<BudgetOptionItem[]>([]);
  readonly productOptions = input<BudgetItemOption[]>([]);
  readonly serviceOptions = input<BudgetItemOption[]>([]);
  readonly submitForm = output<BudgetFormSubmit>();
  readonly close = output<void>();

  protected readonly paymentMethodsError = signal<string | null>(null);
  protected readonly itemsError = signal<string | null>(null);
  protected readonly itemTypes: ReadonlyArray<{ value: BudgetItemType; label: string }> = [
    { value: 'produto', label: 'Produto' },
    { value: 'servico', label: 'Servico' }
  ];

  protected readonly form = this.formBuilder.nonNullable.group({
    estabelecimentoId: ['', [Validators.required]],
    clienteId: ['', [Validators.required]],
    vendedorId: ['', [Validators.required]],
    templateOrcamentoId: ['', [Validators.required]],
    formaPagamentoIds: this.formBuilder.nonNullable.control<string[]>([]),
    observacoes: [''],
    itens: this.formBuilder.array([])
  });

  protected get itemControls(): FormArray {
    return this.form.controls.itens;
  }

  constructor() {
    effect(() => {
      const value = this.initialValue();
      this.resetForm(value ?? this.createEmptyValue());
    });

    this.form.controls.formaPagamentoIds.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.paymentMethodsError.set(null));
  }

  protected save(): void {
    this.paymentMethodsError.set(null);
    this.itemsError.set(null);

    if (this.form.invalid || this.saving()) {
      this.form.markAllAsTouched();
      return;
    }

    const paymentMethodIds = this.form.controls.formaPagamentoIds.getRawValue();
    if (!paymentMethodIds.length) {
      this.paymentMethodsError.set('Selecione ao menos uma forma de pagamento.');
    }

    if (!this.itemControls.length) {
      this.itemsError.set('Adicione ao menos um item ao orcamento.');
    }

    if (this.paymentMethodsError() || this.itemsError()) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitForm.emit(this.buildRequest());
  }

  protected addItem(type: BudgetItemType = 'produto'): void {
    this.itemControls.push(this.createItemGroup({
      tipo: type,
      referenciaId: this.getDefaultReferenceId(type),
      quantidade: '1',
      valorUnitario: this.getDefaultItemPrice(type)
    }));

    this.itemsError.set(null);
    this.syncItemPrice(this.itemControls.length - 1);
  }

  protected removeItem(index: number): void {
    this.itemControls.removeAt(index);
    this.itemsError.set(this.itemControls.length ? null : 'Adicione ao menos um item ao orcamento.');
  }

  protected updateItemType(index: number): void {
    const group = this.itemControls.at(index);
    if (!group) {
      return;
    }

    const tipo = group.get('tipo')?.value as BudgetItemType;
    group.get('referenciaId')?.setValue(this.getDefaultReferenceId(tipo));
    group.get('valorUnitario')?.setValue(this.getDefaultItemPrice(tipo));
  }

  protected syncItemPrice(index: number): void {
    const group = this.itemControls.at(index);
    if (!group) {
      return;
    }

    const tipo = group.get('tipo')?.value as BudgetItemType;
    const referenceId = group.get('referenciaId')?.value as string;
    const options = tipo === 'produto' ? this.productOptions() : this.serviceOptions();
    const option = options.find((item) => item.id === referenceId);

    if (option) {
      group.get('valorUnitario')?.setValue(this.formatMoney(option.valorPadrao));
    }
  }

  protected itemReferenceOptions(index: number): BudgetItemOption[] {
    const group = this.itemControls.at(index);
    const tipo = (group?.get('tipo')?.value as BudgetItemType | undefined) ?? 'produto';

    return tipo === 'produto' ? this.productOptions() : this.serviceOptions();
  }

  protected hasFieldError(
    controlName: keyof Omit<BudgetFormValue, 'itens'>,
    errorName: string
  ): boolean {
    const control = this.form.controls[controlName];
    return control.touched && control.hasError(errorName);
  }

  protected hasItemError(index: number, controlName: keyof BudgetItemFormValue, errorName: string): boolean {
    const group = this.itemControls.at(index);
    const control = group?.get(controlName);
    return !!control && control.touched && control.hasError(errorName);
  }

  private buildRequest(): BudgetFormSubmit {
    const value = this.form.getRawValue();
    const items = value.itens as BudgetItemFormValue[];
    const paymentMethodIds = Array.isArray(value.formaPagamentoIds)
      ? value.formaPagamentoIds
      : value.formaPagamentoIds
          ? [value.formaPagamentoIds]
          : [];

    return {
      estabelecimentoId: value.estabelecimentoId,
      clienteId: value.clienteId,
      vendedorId: value.vendedorId,
      templateOrcamentoId: value.templateOrcamentoId,
      observacoes: this.toOptional(value.observacoes),
      formaPagamentoIds: paymentMethodIds,
      itens: items.map((item) => ({
        produtoId: item.tipo === 'produto' ? item.referenciaId : undefined,
        servicoId: item.tipo === 'servico' ? item.referenciaId : undefined,
        quantidade: this.parseDecimal(item.quantidade),
        valorUnitario: this.parseDecimal(item.valorUnitario)
      }))
    };
  }

  private resetForm(value: BudgetFormValue): void {
    this.form.reset({
      estabelecimentoId: value.estabelecimentoId,
      clienteId: value.clienteId,
      vendedorId: value.vendedorId,
      templateOrcamentoId: value.templateOrcamentoId,
      formaPagamentoIds: value.formaPagamentoIds,
      observacoes: value.observacoes
    });

    this.itemControls.clear();
    value.itens.forEach((item) => this.itemControls.push(this.createItemGroup(item)));

    if (!value.itens.length) {
      this.addItem();
    }

    this.paymentMethodsError.set(null);
    this.itemsError.set(null);
  }

  private createItemGroup(value: BudgetItemFormValue) {
    return this.formBuilder.nonNullable.group({
      tipo: [value.tipo, [Validators.required]],
      referenciaId: [value.referenciaId, [Validators.required]],
      quantidade: [value.quantidade, [Validators.required, Validators.pattern(/^\d+(?:[.,]\d+)?$/)]],
      valorUnitario: [value.valorUnitario, [Validators.required, Validators.pattern(/^\d+(?:[.,]\d{1,2})?$/)]]
    });
  }

  private createEmptyValue(): BudgetFormValue {
    return {
      estabelecimentoId: this.establishmentOptions()[0]?.id ?? '',
      clienteId: this.customerOptions()[0]?.id ?? '',
      vendedorId: this.vendorOptions()[0]?.id ?? '',
      templateOrcamentoId: this.templateOptions()[0]?.id ?? '',
      formaPagamentoIds: [],
      observacoes: '',
      itens: [
        {
          tipo: 'produto',
          referenciaId: this.productOptions()[0]?.id ?? '',
          quantidade: '1',
          valorUnitario: this.getDefaultItemPrice('produto')
        }
      ]
    };
  }

  private getDefaultReferenceId(type: BudgetItemType): string {
    const options = type === 'produto' ? this.productOptions() : this.serviceOptions();
    return options[0]?.id ?? '';
  }

  private getDefaultItemPrice(type: BudgetItemType): string {
    const options = type === 'produto' ? this.productOptions() : this.serviceOptions();
    return this.formatMoney(options[0]?.valorPadrao ?? 0);
  }

  private parseDecimal(value: string): number {
    return Number(value.replace(',', '.'));
  }

  private formatMoney(value: number): string {
    return value ? value.toFixed(2).replace('.', ',') : '0,00';
  }

  private toOptional(value: string): string | undefined {
    const trimmed = value.trim();
    return trimmed ? trimmed : undefined;
  }
}
