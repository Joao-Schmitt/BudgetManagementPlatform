import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { Establishment } from '../../../establishments/models/establishment.model';
import { EstablishmentService } from '../../../establishments/services/establishment.service';
import { EntityGridColumn, EntityGridComponent, EntityGridRow } from '../../../../shared/components/entity-grid/entity-grid.component';
import { VendorFormModalComponent } from '../../components/vendor-form-modal/vendor-form-modal.component';
import { Vendor, VendorEstablishmentOption, VendorFormValue, VendorUpsertRequest } from '../../models/vendor.model';
import { VendorService } from '../../services/vendor.service';

type VendorModalMode = 'create' | 'edit' | 'duplicate';

interface VendorModalState {
  mode: VendorModalMode;
  vendorId: string | null;
  value: VendorFormValue | null;
}

@Component({
  selector: 'app-vendor-list-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, EntityGridComponent, VendorFormModalComponent],
  templateUrl: './vendor-list.page.html',
  styleUrl: './vendor-list.page.scss'
})
export class VendorListPage {
  private readonly vendorService = inject(VendorService);
  private readonly establishmentService = inject(EstablishmentService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly vendors = signal<Vendor[]>([]);
  protected readonly establishments = signal<Establishment[]>([]);
  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly busyVendorId = signal<string | null>(null);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly modalState = signal<VendorModalState | null>(null);

  protected readonly gridColumns: EntityGridColumn[] = [
    { key: 'nome', label: 'Nome' },
    { key: 'estabelecimento', label: 'Estabelecimento' },
    { key: 'usuario', label: 'Usuario' },
    { key: 'contato', label: 'Contato' },
    { key: 'comissao', label: 'Comissao' },
    { key: 'cadastro', label: 'Cadastro' }
  ];

  protected readonly vendorCountLabel = computed(() => {
    const count = this.vendors().length;
    return count === 1 ? '1 vendedor ativo' : `${count} vendedores ativos`;
  });

  protected readonly establishmentOptions = computed<VendorEstablishmentOption[]>(() =>
    this.establishments().map((establishment) => ({
      id: establishment.id,
      label: this.formatEstablishmentLabel(establishment)
    }))
  );

  protected readonly gridRows = computed<EntityGridRow<Vendor>[]>(() =>
    this.vendors().map((vendor) => ({
      id: vendor.id,
      item: vendor,
      cells: {
        nome: vendor.nome,
        estabelecimento: this.resolveEstablishmentLabel(vendor.estabelecimentoId),
        usuario: this.formatShortGuid(vendor.usuarioId),
        contato: this.formatContact(vendor),
        comissao: this.formatPercentage(vendor.percentualComissaoPadrao),
        cadastro: this.formatDate(vendor.criadoEm)
      }
    }))
  );

  protected readonly modalTitle = computed(() => {
    const state = this.modalState();

    switch (state?.mode) {
      case 'edit':
        return 'Editar vendedor';
      case 'duplicate':
        return 'Duplicar vendedor';
      default:
        return 'Novo vendedor';
    }
  });

  protected readonly modalInitialValue = computed(() => this.modalState()?.value ?? null);

  constructor() {
    this.loadEstablishments();
    this.loadVendors();
  }

  protected openCreateModal(): void {
    this.errorMessage.set(null);
    this.modalState.set({
      mode: 'create',
      vendorId: null,
      value: null
    });
  }

  protected openEditModal(vendorId: string): void {
    this.openModalWithVendor(vendorId, 'edit');
  }

  protected openDuplicateModal(vendorId: string): void {
    this.openModalWithVendor(vendorId, 'duplicate');
  }

  protected closeModal(): void {
    if (this.saving()) {
      return;
    }

    this.modalState.set(null);
  }

  protected saveVendor(request: VendorUpsertRequest): void {
    const modalState = this.modalState();

    if (!modalState || this.saving()) {
      return;
    }

    this.saving.set(true);
    this.errorMessage.set(null);

    const request$ =
      modalState.mode === 'edit' && modalState.vendorId
        ? this.vendorService.update(modalState.vendorId, request)
        : this.vendorService.create(request);

    request$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (vendor) => {
          this.saving.set(false);
          this.modalState.set(null);

          if (modalState.mode === 'edit') {
            this.vendors.update((items) =>
              items
                .map((item) => (item.id === vendor.id ? vendor : item))
                .sort((left, right) => left.nome.localeCompare(right.nome, 'pt-BR'))
            );
            return;
          }

          this.vendors.update((items) =>
            [...items, vendor].sort((left, right) => left.nome.localeCompare(right.nome, 'pt-BR'))
          );
        },
        error: () => {
          this.saving.set(false);
          this.errorMessage.set('Nao foi possivel salvar o vendedor. Tente novamente.');
        }
      });
  }

  protected deleteVendor(vendor: Vendor): void {
    const confirmed = window.confirm(`Deseja excluir o vendedor "${vendor.nome}"?`);

    if (!confirmed) {
      return;
    }

    this.busyVendorId.set(vendor.id);
    this.errorMessage.set(null);

    this.vendorService
      .delete(vendor.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.busyVendorId.set(null);
          this.vendors.update((items) => items.filter((item) => item.id !== vendor.id));
        },
        error: () => {
          this.busyVendorId.set(null);
          this.errorMessage.set('Nao foi possivel excluir o vendedor. Tente novamente.');
        }
      });
  }

  protected rowBusy(vendorId: string): boolean {
    return this.busyVendorId() === vendorId;
  }

  private loadVendors(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.vendorService
      .getAll()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (items) => {
          this.loading.set(false);
          this.vendors.set([...items].sort((left, right) => left.nome.localeCompare(right.nome, 'pt-BR')));
        },
        error: () => {
          this.loading.set(false);
          this.errorMessage.set('Nao foi possivel carregar os vendedores. Atualize a pagina e tente novamente.');
        }
      });
  }

  private loadEstablishments(): void {
    this.establishmentService
      .getAll()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (items) => this.establishments.set([...items].sort((left, right) => left.razaoSocial.localeCompare(right.razaoSocial, 'pt-BR'))),
        error: () => this.establishments.set([])
      });
  }

  private openModalWithVendor(vendorId: string, mode: Exclude<VendorModalMode, 'create'>): void {
    this.busyVendorId.set(vendorId);
    this.errorMessage.set(null);

    this.vendorService
      .getById(vendorId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (vendor) => {
          this.busyVendorId.set(null);
          this.modalState.set({
            mode,
            vendorId: mode === 'edit' ? vendor.id : null,
            value: this.toFormValue(vendor)
          });
        },
        error: () => {
          this.busyVendorId.set(null);
          this.errorMessage.set('Nao foi possivel carregar os dados do vendedor. Tente novamente.');
        }
      });
  }

  private toFormValue(vendor: Vendor): VendorFormValue {
    return {
      estabelecimentoId: vendor.estabelecimentoId,
      usuarioId: vendor.usuarioId ?? '',
      nome: vendor.nome,
      email: vendor.email ?? '',
      telefone: vendor.telefone ?? '',
      percentualComissaoPadrao: vendor.percentualComissaoPadrao.toString()
    };
  }

  private resolveEstablishmentLabel(establishmentId: string): string {
    const establishment = this.establishments().find((item) => item.id === establishmentId);

    if (!establishment) {
      return this.formatShortGuid(establishmentId);
    }

    return this.formatEstablishmentLabel(establishment);
  }

  private formatEstablishmentLabel(establishment: Establishment): string {
    const fantasyName = establishment.nomeFantasia?.trim();

    if (fantasyName) {
      return `${establishment.razaoSocial} - ${fantasyName}`;
    }

    return establishment.razaoSocial;
  }

  private formatContact(vendor: Vendor): string {
    return vendor.email ?? vendor.telefone ?? '-';
  }

  private formatPercentage(value: number): string {
    return `${new Intl.NumberFormat('pt-BR', {
      maximumFractionDigits: 2
    }).format(value)}%`;
  }

  private formatShortGuid(value: string | null | undefined): string {
    const normalized = value?.trim();

    if (!normalized) {
      return '-';
    }

    if (normalized.length <= 13) {
      return normalized;
    }

    return `${normalized.slice(0, 8)}…${normalized.slice(-4)}`;
  }

  private formatDate(value: string): string {
    return new Date(value).toLocaleDateString('pt-BR');
  }
}
