import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { EntityGridColumn, EntityGridComponent, EntityGridRow } from '../../../../shared/components/entity-grid/entity-grid.component';
import {
  PaymentMethod,
  PaymentMethodFormValue,
  PaymentMethodUpsertRequest
} from '../../models/payment-method.model';
import { PaymentMethodService } from '../../services/payment-method.service';
import { PaymentMethodFormModalComponent } from '../../components/payment-method-form-modal/payment-method-form-modal.component';

type PaymentMethodModalMode = 'create' | 'edit' | 'duplicate';

interface PaymentMethodModalState {
  mode: PaymentMethodModalMode;
  paymentMethodId: string | null;
  value: PaymentMethodFormValue | null;
}

@Component({
  selector: 'app-payment-method-list-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, EntityGridComponent, PaymentMethodFormModalComponent],
  templateUrl: './payment-method-list.page.html',
  styleUrl: './payment-method-list.page.scss'
})
export class PaymentMethodListPage {
  private readonly paymentMethodService = inject(PaymentMethodService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly paymentMethods = signal<PaymentMethod[]>([]);
  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly busyPaymentMethodId = signal<string | null>(null);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly modalState = signal<PaymentMethodModalState | null>(null);

  protected readonly gridColumns: EntityGridColumn[] = [
    { key: 'nome', label: 'Nome' },
    { key: 'tipo', label: 'Tipo' }
  ];

  protected readonly paymentMethodCountLabel = computed(() => {
    const count = this.paymentMethods().length;
    return count === 1 ? '1 forma ativa' : `${count} formas ativas`;
  });

  protected readonly gridRows = computed<EntityGridRow<PaymentMethod>[]>(() =>
    this.paymentMethods().map((paymentMethod) => ({
      id: paymentMethod.id,
      item: paymentMethod,
      cells: {
        nome: paymentMethod.nome,
        tipo: paymentMethod.tipo
      }
    }))
  );

  protected readonly modalTitle = computed(() => {
    const state = this.modalState();

    switch (state?.mode) {
      case 'edit':
        return 'Editar forma de pagamento';
      case 'duplicate':
        return 'Duplicar forma de pagamento';
      default:
        return 'Nova forma de pagamento';
    }
  });

  protected readonly modalInitialValue = computed(() => this.modalState()?.value ?? null);

  constructor() {
    this.loadPaymentMethods();
  }

  protected openCreateModal(): void {
    this.errorMessage.set(null);
    this.modalState.set({
      mode: 'create',
      paymentMethodId: null,
      value: null
    });
  }

  protected openEditModal(paymentMethodId: string): void {
    this.openModalWithPaymentMethod(paymentMethodId, 'edit');
  }

  protected openDuplicateModal(paymentMethodId: string): void {
    this.openModalWithPaymentMethod(paymentMethodId, 'duplicate');
  }

  protected closeModal(): void {
    if (this.saving()) {
      return;
    }

    this.modalState.set(null);
  }

  protected savePaymentMethod(request: PaymentMethodUpsertRequest): void {
    const modalState = this.modalState();

    if (!modalState || this.saving()) {
      return;
    }

    this.saving.set(true);
    this.errorMessage.set(null);

    const request$ =
      modalState.mode === 'edit' && modalState.paymentMethodId
        ? this.paymentMethodService.update(modalState.paymentMethodId, request)
        : this.paymentMethodService.create(request);

    request$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (paymentMethod) => {
          this.saving.set(false);
          this.modalState.set(null);

          if (modalState.mode === 'edit') {
            this.paymentMethods.update((items) =>
              items
                .map((item) => (item.id === paymentMethod.id ? paymentMethod : item))
                .sort((left, right) => left.nome.localeCompare(right.nome, 'pt-BR'))
            );
            return;
          }

          this.paymentMethods.update((items) =>
            [...items, paymentMethod].sort((left, right) => left.nome.localeCompare(right.nome, 'pt-BR'))
          );
        },
        error: () => {
          this.saving.set(false);
          this.errorMessage.set('Nao foi possivel salvar a forma de pagamento. Tente novamente.');
        }
      });
  }

  protected deletePaymentMethod(paymentMethod: PaymentMethod): void {
    const confirmed = window.confirm(`Deseja excluir a forma de pagamento "${paymentMethod.nome}"?`);

    if (!confirmed) {
      return;
    }

    this.busyPaymentMethodId.set(paymentMethod.id);
    this.errorMessage.set(null);

    this.paymentMethodService
      .delete(paymentMethod.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.busyPaymentMethodId.set(null);
          this.paymentMethods.update((items) => items.filter((item) => item.id !== paymentMethod.id));
        },
        error: () => {
          this.busyPaymentMethodId.set(null);
          this.errorMessage.set('Nao foi possivel excluir a forma de pagamento. Tente novamente.');
        }
      });
  }

  protected rowBusy(paymentMethodId: string): boolean {
    return this.busyPaymentMethodId() === paymentMethodId;
  }

  private loadPaymentMethods(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.paymentMethodService
      .getAll()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (items) => {
          this.loading.set(false);
          this.paymentMethods.set([...items].sort((left, right) => left.nome.localeCompare(right.nome, 'pt-BR')));
        },
        error: () => {
          this.loading.set(false);
          this.errorMessage.set('Nao foi possivel carregar as formas de pagamento. Atualize a pagina e tente novamente.');
        }
      });
  }

  private openModalWithPaymentMethod(paymentMethodId: string, mode: Exclude<PaymentMethodModalMode, 'create'>): void {
    this.busyPaymentMethodId.set(paymentMethodId);
    this.errorMessage.set(null);

    this.paymentMethodService
      .getById(paymentMethodId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (paymentMethod) => {
          this.busyPaymentMethodId.set(null);
          this.modalState.set({
            mode,
            paymentMethodId: mode === 'edit' ? paymentMethod.id : null,
            value: this.toFormValue(paymentMethod)
          });
        },
        error: () => {
          this.busyPaymentMethodId.set(null);
          this.errorMessage.set('Nao foi possivel carregar os dados da forma de pagamento. Tente novamente.');
        }
      });
  }

  private toFormValue(paymentMethod: PaymentMethod): PaymentMethodFormValue {
    return {
      nome: paymentMethod.nome,
      tipo: paymentMethod.tipo
    };
  }
}
