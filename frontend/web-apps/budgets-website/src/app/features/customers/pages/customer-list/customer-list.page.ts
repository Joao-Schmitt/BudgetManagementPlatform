import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import {
  Customer,
  CustomerFormValue,
  CustomerUpsertRequest
} from '../../models/customer.model';
import { CustomerService } from '../../services/customer.service';
import { CustomerFormModalComponent } from '../../components/customer-form-modal/customer-form-modal.component';
import {
  EntityGridColumn,
  EntityGridComponent,
  EntityGridRow
} from '../../../../shared/components/entity-grid/entity-grid.component';

type CustomerModalMode = 'create' | 'edit' | 'duplicate';

interface CustomerModalState {
  mode: CustomerModalMode;
  customerId: string | null;
  value: CustomerFormValue | null;
}

@Component({
  selector: 'app-customer-list-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, CustomerFormModalComponent, EntityGridComponent],
  templateUrl: './customer-list.page.html',
  styleUrl: './customer-list.page.scss'
})
export class CustomerListPage {
  private readonly customerService = inject(CustomerService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly customers = signal<Customer[]>([]);
  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly busyCustomerId = signal<string | null>(null);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly modalState = signal<CustomerModalState | null>(null);
  protected readonly gridColumns: EntityGridColumn[] = [
    { key: 'nome', label: 'Nome' },
    { key: 'documento', label: 'Documento' },
    { key: 'contato', label: 'Contato principal' },
    { key: 'localidade', label: 'Localidade' },
    { key: 'cadastro', label: 'Cadastro' }
  ];

  protected readonly customerCountLabel = computed(() => {
    const count = this.customers().length;
    return count === 1 ? '1 cliente ativo' : `${count} clientes ativos`;
  });

  protected readonly gridRows = computed<EntityGridRow<Customer>[]>(() =>
    this.customers().map((customer) => ({
      id: customer.id,
      item: customer,
      cells: {
        nome: customer.nome,
        documento: customer.documento || '-',
        contato: this.formatContact(customer),
        localidade: this.formatLocation(customer),
        cadastro: this.formatDate(customer.criadoEm)
      }
    }))
  );

  protected readonly modalTitle = computed(() => {
    const state = this.modalState();

    switch (state?.mode) {
      case 'edit':
        return 'Editar cliente';
      case 'duplicate':
        return 'Duplicar cliente';
      default:
        return 'Novo cliente';
    }
  });

  protected readonly modalInitialValue = computed(() => this.modalState()?.value ?? null);

  constructor() {
    this.loadCustomers();
  }

  protected openCreateModal(): void {
    this.errorMessage.set(null);
    this.modalState.set({
      mode: 'create',
      customerId: null,
      value: null
    });
  }

  protected openEditModal(customerId: string): void {
    this.openModalWithCustomer(customerId, 'edit');
  }

  protected openDuplicateModal(customerId: string): void {
    this.openModalWithCustomer(customerId, 'duplicate');
  }

  protected closeModal(): void {
    if (this.saving()) {
      return;
    }

    this.modalState.set(null);
  }

  protected saveCustomer(request: CustomerUpsertRequest): void {
    const modalState = this.modalState();

    if (!modalState || this.saving()) {
      return;
    }

    this.saving.set(true);
    this.errorMessage.set(null);

    const request$ =
      modalState.mode === 'edit' && modalState.customerId
        ? this.customerService.update(modalState.customerId, request)
        : this.customerService.create(request);

    request$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (customer) => {
          this.saving.set(false);
          this.modalState.set(null);

          if (modalState.mode === 'edit') {
            this.customers.update((customers) =>
              customers
                .map((item) => (item.id === customer.id ? customer : item))
                .sort((left, right) => left.nome.localeCompare(right.nome, 'pt-BR'))
            );
            return;
          }

          this.customers.update((customers) =>
            [...customers, customer].sort((left, right) => left.nome.localeCompare(right.nome, 'pt-BR'))
          );
        },
        error: () => {
          this.saving.set(false);
          this.errorMessage.set('Nao foi possivel salvar o cliente. Tente novamente.');
        }
      });
  }

  protected deleteCustomer(customer: Customer): void {
    const confirmed = window.confirm(`Deseja excluir o cliente "${customer.nome}"?`);

    if (!confirmed) {
      return;
    }

    this.busyCustomerId.set(customer.id);
    this.errorMessage.set(null);

    this.customerService
      .delete(customer.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.busyCustomerId.set(null);
          this.customers.update((customers) => customers.filter((item) => item.id !== customer.id));
        },
        error: () => {
          this.busyCustomerId.set(null);
          this.errorMessage.set('Nao foi possivel excluir o cliente. Tente novamente.');
        }
      });
  }

  protected formatContact(customer: Customer): string {
    return customer.whatsApp ?? customer.telefone ?? customer.email ?? '-';
  }

  protected formatLocation(customer: Customer): string {
    const city = customer.cidade?.trim();
    const state = customer.uf?.trim();

    if (city && state) {
      return `${city}/${state}`;
    }

    return city || state || '-';
  }

  protected formatDate(value: string): string {
    return new Date(value).toLocaleDateString('pt-BR');
  }

  private loadCustomers(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.customerService
      .getAll()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (customers) => {
          this.loading.set(false);
          this.customers.set(
            [...customers].sort((left, right) => left.nome.localeCompare(right.nome, 'pt-BR'))
          );
        },
        error: () => {
          this.loading.set(false);
          this.errorMessage.set('Nao foi possivel carregar os clientes. Atualize a pagina e tente novamente.');
        }
      });
  }

  private openModalWithCustomer(customerId: string, mode: Exclude<CustomerModalMode, 'create'>): void {
    this.busyCustomerId.set(customerId);
    this.errorMessage.set(null);

    this.customerService
      .getById(customerId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (customer) => {
          this.busyCustomerId.set(null);
          this.modalState.set({
            mode,
            customerId: mode === 'edit' ? customer.id : null,
            value: this.toFormValue(customer)
          });
        },
        error: () => {
          this.busyCustomerId.set(null);
          this.errorMessage.set('Nao foi possivel carregar os dados do cliente. Tente novamente.');
        }
      });
  }

  private toFormValue(customer: Customer): CustomerFormValue {
    return {
      nome: customer.nome,
      documento: customer.documento ?? '',
      email: customer.email ?? '',
      telefone: customer.telefone ?? '',
      whatsApp: customer.whatsApp ?? '',
      cep: customer.cep ?? '',
      logradouro: customer.logradouro ?? '',
      numero: customer.numero ?? '',
      complemento: customer.complemento ?? '',
      bairro: customer.bairro ?? '',
      cidade: customer.cidade ?? '',
      uf: customer.uf ?? '',
      observacao: customer.observacao ?? ''
    };
  }
}
