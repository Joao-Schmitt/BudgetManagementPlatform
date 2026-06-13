import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { EntityGridColumn, EntityGridComponent, EntityGridRow } from '../../../../shared/components/entity-grid/entity-grid.component';
import {
  ServiceFormValue,
  ServiceItem,
  ServiceUpsertRequest
} from '../../models/service.model';
import { ServiceCatalogService } from '../../services.service';
import { ServiceFormModalComponent } from '../../components/service-form-modal/service-form-modal.component';

type ServiceModalMode = 'create' | 'edit' | 'duplicate';

interface ServiceModalState {
  mode: ServiceModalMode;
  serviceId: string | null;
  value: ServiceFormValue | null;
}

@Component({
  selector: 'app-service-list-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, EntityGridComponent, ServiceFormModalComponent],
  templateUrl: './service-list.page.html',
  styleUrl: './service-list.page.scss'
})
export class ServiceListPage {
  private readonly serviceCatalog = inject(ServiceCatalogService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly services = signal<ServiceItem[]>([]);
  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly busyServiceId = signal<string | null>(null);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly modalState = signal<ServiceModalState | null>(null);

  protected readonly gridColumns: EntityGridColumn[] = [
    { key: 'codigo', label: 'Codigo' },
    { key: 'nome', label: 'Nome' },
    { key: 'valor', label: 'Valor' },
    { key: 'custo', label: 'Custo' },
    { key: 'descricao', label: 'Descricao' }
  ];

  protected readonly serviceCountLabel = computed(() => {
    const count = this.services().length;
    return count === 1 ? '1 servico ativo' : `${count} servicos ativos`;
  });

  protected readonly gridRows = computed<EntityGridRow<ServiceItem>[]>(() =>
    this.services().map((service) => ({
      id: service.id,
      item: service,
      cells: {
        codigo: service.codigo || '-',
        nome: service.nome,
        valor: this.formatCurrency(service.valor),
        custo: service.custo == null ? '-' : this.formatCurrency(service.custo),
        descricao: service.descricao || '-'
      }
    }))
  );

  protected readonly modalTitle = computed(() => {
    const state = this.modalState();

    switch (state?.mode) {
      case 'edit':
        return 'Editar servico';
      case 'duplicate':
        return 'Duplicar servico';
      default:
        return 'Novo servico';
    }
  });

  protected readonly modalInitialValue = computed(() => this.modalState()?.value ?? null);

  constructor() {
    this.loadServices();
  }

  protected openCreateModal(): void {
    this.errorMessage.set(null);
    this.modalState.set({
      mode: 'create',
      serviceId: null,
      value: null
    });
  }

  protected openEditModal(serviceId: string): void {
    this.openModalWithService(serviceId, 'edit');
  }

  protected openDuplicateModal(serviceId: string): void {
    this.openModalWithService(serviceId, 'duplicate');
  }

  protected closeModal(): void {
    if (this.saving()) {
      return;
    }

    this.modalState.set(null);
  }

  protected saveService(request: ServiceUpsertRequest): void {
    const modalState = this.modalState();

    if (!modalState || this.saving()) {
      return;
    }

    this.saving.set(true);
    this.errorMessage.set(null);

    const request$ =
      modalState.mode === 'edit' && modalState.serviceId
        ? this.serviceCatalog.update(modalState.serviceId, request)
        : this.serviceCatalog.create(request);

    request$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (service) => {
          this.saving.set(false);
          this.modalState.set(null);

          if (modalState.mode === 'edit') {
            this.services.update((items) =>
              items
                .map((item) => (item.id === service.id ? service : item))
                .sort((left, right) => left.nome.localeCompare(right.nome, 'pt-BR'))
            );
            return;
          }

          this.services.update((items) =>
            [...items, service].sort((left, right) => left.nome.localeCompare(right.nome, 'pt-BR'))
          );
        },
        error: () => {
          this.saving.set(false);
          this.errorMessage.set('Nao foi possivel salvar o servico. Tente novamente.');
        }
      });
  }

  protected deleteService(service: ServiceItem): void {
    const confirmed = window.confirm(`Deseja excluir o servico "${service.nome}"?`);

    if (!confirmed) {
      return;
    }

    this.busyServiceId.set(service.id);
    this.errorMessage.set(null);

    this.serviceCatalog
      .delete(service.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.busyServiceId.set(null);
          this.services.update((items) => items.filter((item) => item.id !== service.id));
        },
        error: () => {
          this.busyServiceId.set(null);
          this.errorMessage.set('Nao foi possivel excluir o servico. Tente novamente.');
        }
      });
  }

  protected rowBusy(serviceId: string): boolean {
    return this.busyServiceId() === serviceId;
  }

  private loadServices(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.serviceCatalog
      .getAll()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (items) => {
          this.loading.set(false);
          this.services.set([...items].sort((left, right) => left.nome.localeCompare(right.nome, 'pt-BR')));
        },
        error: () => {
          this.loading.set(false);
          this.errorMessage.set('Nao foi possivel carregar os servicos. Atualize a pagina e tente novamente.');
        }
      });
  }

  private openModalWithService(serviceId: string, mode: Exclude<ServiceModalMode, 'create'>): void {
    this.busyServiceId.set(serviceId);
    this.errorMessage.set(null);

    this.serviceCatalog
      .getById(serviceId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (service) => {
          this.busyServiceId.set(null);
          this.modalState.set({
            mode,
            serviceId: mode === 'edit' ? service.id : null,
            value: this.toFormValue(service)
          });
        },
        error: () => {
          this.busyServiceId.set(null);
          this.errorMessage.set('Nao foi possivel carregar os dados do servico. Tente novamente.');
        }
      });
  }

  private toFormValue(service: ServiceItem): ServiceFormValue {
    return {
      codigo: service.codigo ?? '',
      nome: service.nome,
      descricao: service.descricao ?? '',
      valor: service.valor.toString(),
      custo: service.custo == null ? '' : service.custo.toString()
    };
  }

  private formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }
}
