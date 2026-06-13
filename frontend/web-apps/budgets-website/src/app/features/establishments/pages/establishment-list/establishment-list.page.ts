import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { EntityGridColumn, EntityGridComponent, EntityGridRow } from '../../../../shared/components/entity-grid/entity-grid.component';
import {
  Establishment,
  EstablishmentFormValue,
  EstablishmentUpsertRequest
} from '../../models/establishment.model';
import { EstablishmentService } from '../../services/establishment.service';
import { EstablishmentFormModalComponent } from '../../components/establishment-form-modal/establishment-form-modal.component';

type EstablishmentModalMode = 'create' | 'edit' | 'duplicate';

interface EstablishmentModalState {
  mode: EstablishmentModalMode;
  establishmentId: string | null;
  value: EstablishmentFormValue | null;
}

@Component({
  selector: 'app-establishment-list-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, EntityGridComponent, EstablishmentFormModalComponent],
  templateUrl: './establishment-list.page.html',
  styleUrl: './establishment-list.page.scss'
})
export class EstablishmentListPage {
  private readonly establishmentService = inject(EstablishmentService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly establishments = signal<Establishment[]>([]);
  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly busyEstablishmentId = signal<string | null>(null);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly modalState = signal<EstablishmentModalState | null>(null);

  protected readonly gridColumns: EntityGridColumn[] = [
    { key: 'razaoSocial', label: 'Razao social' },
    { key: 'nomeFantasia', label: 'Nome fantasia' },
    { key: 'cnpj', label: 'CNPJ' },
    { key: 'contato', label: 'Contato principal' },
    { key: 'localidade', label: 'Localidade' }
  ];

  protected readonly establishmentCountLabel = computed(() => {
    const count = this.establishments().length;
    return count === 1 ? '1 estabelecimento ativo' : `${count} estabelecimentos ativos`;
  });

  protected readonly gridRows = computed<EntityGridRow<Establishment>[]>(() =>
    this.establishments().map((establishment) => ({
      id: establishment.id,
      item: establishment,
      cells: {
        razaoSocial: establishment.razaoSocial,
        nomeFantasia: establishment.nomeFantasia || '-',
        cnpj: establishment.cnpj || '-',
        contato: this.formatContact(establishment),
        localidade: this.formatLocation(establishment)
      }
    }))
  );

  protected readonly modalTitle = computed(() => {
    const state = this.modalState();

    switch (state?.mode) {
      case 'edit':
        return 'Editar estabelecimento';
      case 'duplicate':
        return 'Duplicar estabelecimento';
      default:
        return 'Novo estabelecimento';
    }
  });

  protected readonly modalInitialValue = computed(() => this.modalState()?.value ?? null);

  constructor() {
    this.loadEstablishments();
  }

  protected openCreateModal(): void {
    this.errorMessage.set(null);
    this.modalState.set({
      mode: 'create',
      establishmentId: null,
      value: null
    });
  }

  protected openEditModal(establishmentId: string): void {
    this.openModalWithEstablishment(establishmentId, 'edit');
  }

  protected openDuplicateModal(establishmentId: string): void {
    this.openModalWithEstablishment(establishmentId, 'duplicate');
  }

  protected closeModal(): void {
    if (this.saving()) {
      return;
    }

    this.modalState.set(null);
  }

  protected saveEstablishment(request: EstablishmentUpsertRequest): void {
    const modalState = this.modalState();

    if (!modalState || this.saving()) {
      return;
    }

    this.saving.set(true);
    this.errorMessage.set(null);

    const request$ =
      modalState.mode === 'edit' && modalState.establishmentId
        ? this.establishmentService.update(modalState.establishmentId, request)
        : this.establishmentService.create(request);

    request$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (establishment) => {
          this.saving.set(false);
          this.modalState.set(null);

          if (modalState.mode === 'edit') {
            this.establishments.update((items) =>
              items
                .map((item) => (item.id === establishment.id ? establishment : item))
                .sort((left, right) => left.razaoSocial.localeCompare(right.razaoSocial, 'pt-BR'))
            );
            return;
          }

          this.establishments.update((items) =>
            [...items, establishment].sort((left, right) => left.razaoSocial.localeCompare(right.razaoSocial, 'pt-BR'))
          );
        },
        error: () => {
          this.saving.set(false);
          this.errorMessage.set('Nao foi possivel salvar o estabelecimento. Tente novamente.');
        }
      });
  }

  protected deleteEstablishment(establishment: Establishment): void {
    const confirmed = window.confirm(`Deseja excluir o estabelecimento "${establishment.razaoSocial}"?`);

    if (!confirmed) {
      return;
    }

    this.busyEstablishmentId.set(establishment.id);
    this.errorMessage.set(null);

    this.establishmentService
      .delete(establishment.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.busyEstablishmentId.set(null);
          this.establishments.update((items) => items.filter((item) => item.id !== establishment.id));
        },
        error: () => {
          this.busyEstablishmentId.set(null);
          this.errorMessage.set('Nao foi possivel excluir o estabelecimento. Tente novamente.');
        }
      });
  }

  protected rowBusy(establishmentId: string): boolean {
    return this.busyEstablishmentId() === establishmentId;
  }

  protected formatContact(establishment: Establishment): string {
    return establishment.whatsApp ?? establishment.telefone ?? establishment.email ?? '-';
  }

  protected formatLocation(establishment: Establishment): string {
    const city = establishment.cidade?.trim();
    const state = establishment.uf?.trim();

    if (city && state) {
      return `${city}/${state}`;
    }

    return city || state || '-';
  }

  protected formatDate(value: string): string {
    return new Date(value).toLocaleDateString('pt-BR');
  }

  private loadEstablishments(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.establishmentService
      .getAll()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (items) => {
          this.loading.set(false);
          this.establishments.set(
            [...items].sort((left, right) => left.razaoSocial.localeCompare(right.razaoSocial, 'pt-BR'))
          );
        },
        error: () => {
          this.loading.set(false);
          this.errorMessage.set('Nao foi possivel carregar os estabelecimentos. Atualize a pagina e tente novamente.');
        }
      });
  }

  private openModalWithEstablishment(establishmentId: string, mode: Exclude<EstablishmentModalMode, 'create'>): void {
    this.busyEstablishmentId.set(establishmentId);
    this.errorMessage.set(null);

    this.establishmentService
      .getById(establishmentId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (establishment) => {
          this.busyEstablishmentId.set(null);
          this.modalState.set({
            mode,
            establishmentId: mode === 'edit' ? establishment.id : null,
            value: this.toFormValue(establishment)
          });
        },
        error: () => {
          this.busyEstablishmentId.set(null);
          this.errorMessage.set('Nao foi possivel carregar os dados do estabelecimento. Tente novamente.');
        }
      });
  }

  private toFormValue(establishment: Establishment): EstablishmentFormValue {
    return {
      razaoSocial: establishment.razaoSocial,
      nomeFantasia: establishment.nomeFantasia ?? '',
      cnpj: establishment.cnpj ?? '',
      inscricaoEstadual: establishment.inscricaoEstadual ?? '',
      email: establishment.email ?? '',
      telefone: establishment.telefone ?? '',
      whatsApp: establishment.whatsApp ?? '',
      cep: establishment.cep ?? '',
      logradouro: establishment.logradouro ?? '',
      numero: establishment.numero ?? '',
      complemento: establishment.complemento ?? '',
      bairro: establishment.bairro ?? '',
      cidade: establishment.cidade ?? '',
      uf: establishment.uf ?? '',
      logoUrl: establishment.logoUrl ?? ''
    };
  }
}
