import { CommonModule } from '@angular/common';
import { HttpResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { forkJoin } from 'rxjs';

import { ZardAlertComponent } from '@/shared/components/alert/alert.component';

import { AuthStateService } from '../../../../core/auth/auth-state.service';
import {
  EntityGridColumn,
  EntityGridComponent,
  EntityGridRow
} from '../../../../shared/components/entity-grid/entity-grid.component';
import { Customer } from '../../../customers/models/customer.model';
import { CustomerService } from '../../../customers/services/customer.service';
import { Establishment } from '../../../establishments/models/establishment.model';
import { EstablishmentService } from '../../../establishments/services/establishment.service';
import { PaymentMethod } from '../../../payment-methods/models/payment-method.model';
import { PaymentMethodService } from '../../../payment-methods/services/payment-method.service';
import { Product } from '../../../products/models/product.model';
import { ProductService } from '../../../products/services/product.service';
import { ServiceItem } from '../../../services/models/service.model';
import { ServiceCatalogService } from '../../../services/services.service';
import { TemplateOrcamento } from '../../../templates/models/template-orcamento.model';
import { TemplateOrcamentoService } from '../../../templates/services/template-orcamento.service';
import { Vendor } from '../../../vendors/models/vendor.model';
import { VendorService } from '../../../vendors/services/vendor.service';
import { BudgetFormModalComponent } from '../../components/budget-form-modal/budget-form-modal.component';
import {
  Budget,
  BudgetFileType,
  BudgetFormSubmit,
  BudgetFormValue,
  BudgetItemOption,
  BudgetOptionItem,
  BudgetSaveRequest
} from '../../models/budget.model';
import { BudgetService } from '../../services/budget.service';

type BudgetModalMode = 'create' | 'edit' | 'duplicate';

interface BudgetModalState {
  mode: BudgetModalMode;
  budgetId: string | null;
  value: BudgetFormValue | null;
}

@Component({
  selector: 'app-budget-list-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ZardAlertComponent, EntityGridComponent, BudgetFormModalComponent],
  templateUrl: './budget-list.page.html',
  styleUrl: './budget-list.page.scss'
})
export class BudgetListPage {
  private readonly budgetService = inject(BudgetService);
  private readonly customerService = inject(CustomerService);
  private readonly establishmentService = inject(EstablishmentService);
  private readonly vendorService = inject(VendorService);
  private readonly templateService = inject(TemplateOrcamentoService);
  private readonly paymentMethodService = inject(PaymentMethodService);
  private readonly productService = inject(ProductService);
  private readonly serviceCatalogService = inject(ServiceCatalogService);
  private readonly authState = inject(AuthStateService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly budgets = signal<Budget[]>([]);
  protected readonly customers = signal<Customer[]>([]);
  protected readonly establishments = signal<Establishment[]>([]);
  protected readonly vendors = signal<Vendor[]>([]);
  protected readonly templates = signal<TemplateOrcamento[]>([]);
  protected readonly paymentMethods = signal<PaymentMethod[]>([]);
  protected readonly products = signal<Product[]>([]);
  protected readonly serviceItems = signal<ServiceItem[]>([]);
  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly busyBudgetId = signal<string | null>(null);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly successMessage = signal<string | null>(null);
  protected readonly modalState = signal<BudgetModalState | null>(null);

  protected readonly gridColumns: EntityGridColumn[] = [
    { key: 'cliente', label: 'Cliente' },
    { key: 'estabelecimento', label: 'Estabelecimento' },
    { key: 'vendedor', label: 'Vendedor' },
    { key: 'template', label: 'Template' },
    { key: 'cadastro', label: 'Criado em' }
  ];

  protected readonly customerOptions = computed<BudgetOptionItem[]>(() =>
    this.customers()
      .map((item) => ({ id: item.id, label: item.nome }))
      .sort((left, right) => left.label.localeCompare(right.label, 'pt-BR'))
  );

  protected readonly establishmentOptions = computed<BudgetOptionItem[]>(() =>
    this.establishments()
      .map((item) => ({ id: item.id, label: item.nomeFantasia?.trim() || item.razaoSocial }))
      .sort((left, right) => left.label.localeCompare(right.label, 'pt-BR'))
  );

  protected readonly vendorOptions = computed<BudgetOptionItem[]>(() =>
    this.vendors()
      .map((item) => ({ id: item.id, label: item.nome }))
      .sort((left, right) => left.label.localeCompare(right.label, 'pt-BR'))
  );

  protected readonly templateOptions = computed<BudgetOptionItem[]>(() =>
    this.templates()
      .map((item) => ({ id: item.id, label: item.titulo }))
      .sort((left, right) => left.label.localeCompare(right.label, 'pt-BR'))
  );

  protected readonly paymentMethodOptions = computed<BudgetOptionItem[]>(() =>
    this.paymentMethods()
      .map((item) => ({ id: item.id, label: `${item.nome} · ${item.tipo}` }))
      .sort((left, right) => left.label.localeCompare(right.label, 'pt-BR'))
  );

  protected readonly productOptions = computed<BudgetItemOption[]>(() =>
    this.products()
      .map((item) => ({
        id: item.id,
        label: `${item.nome}${item.codigo ? ` · ${item.codigo}` : ''}`,
        valorPadrao: item.valorVenda
      }))
      .sort((left, right) => left.label.localeCompare(right.label, 'pt-BR'))
  );

  protected readonly serviceOptions = computed<BudgetItemOption[]>(() =>
    this.serviceItems()
      .map((item) => ({
        id: item.id,
        label: `${item.nome}${item.codigo ? ` · ${item.codigo}` : ''}`,
        valorPadrao: item.valor
      }))
      .sort((left, right) => left.label.localeCompare(right.label, 'pt-BR'))
  );

  protected readonly budgetCountLabel = computed(() => {
    const count = this.budgets().length;
    return count === 1 ? '1 orcamento ativo' : `${count} orcamentos ativos`;
  });

  protected readonly gridRows = computed<EntityGridRow<Budget>[]>(() =>
    this.budgets().map((budget) => ({
      id: budget.id,
      item: budget,
      cells: {
        cliente: this.findCustomerName(budget.clienteId),
        estabelecimento: this.findEstablishmentName(budget.estabelecimentoId),
        vendedor: this.findVendorName(budget.vendedorId),
        template: this.findTemplateTitle(budget.templateOrcamentoId),
        cadastro: this.formatDate(budget.criadoEm)
      }
    }))
  );

  protected readonly modalTitle = computed(() => {
    const state = this.modalState();

    switch (state?.mode) {
      case 'edit':
        return 'Editar orcamento';
      case 'duplicate':
        return 'Duplicar orcamento';
      default:
        return 'Novo orcamento';
    }
  });

  protected readonly modalInitialValue = computed(() => this.modalState()?.value ?? null);

  constructor() {
    this.loadData();
  }

  protected openCreateModal(): void {
    this.errorMessage.set(null);
    this.successMessage.set(null);
    this.modalState.set({
      mode: 'create',
      budgetId: null,
      value: null
    });
  }

  protected openEditModal(budgetId: string): void {
    this.openModalWithBudget(budgetId, 'edit');
  }

  protected openDuplicateModal(budgetId: string): void {
    this.openModalWithBudget(budgetId, 'duplicate');
  }

  protected closeModal(): void {
    if (this.saving()) {
      return;
    }

    this.modalState.set(null);
  }

  protected saveBudget(request: BudgetFormSubmit): void {
    const modalState = this.modalState();
    const currentUser = this.authState.currentUser();

    if (!modalState || !currentUser?.id || this.saving()) {
      this.errorMessage.set('Nao foi possivel identificar o usuario logado para salvar o orcamento.');
      return;
    }

    this.saving.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const payload: BudgetSaveRequest = {
      ...request,
      usuarioId: currentUser.id
    };

    const request$ =
      modalState.mode === 'edit' && modalState.budgetId
        ? this.budgetService.update(modalState.budgetId, payload)
        : this.budgetService.create(payload);

    request$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (budget) => {
          this.saving.set(false);
          this.modalState.set(null);

          if (modalState.mode === 'edit') {
            this.budgets.update((items) =>
              items
                .map((item) => (item.id === budget.id ? budget : item))
                .sort((left, right) => right.criadoEm.localeCompare(left.criadoEm))
            );
          } else {
            this.budgets.update((items) => [budget, ...items].sort((left, right) => right.criadoEm.localeCompare(left.criadoEm)));
          }

          this.successMessage.set('Orcamento salvo com sucesso.');
        },
        error: () => {
          this.saving.set(false);
          this.errorMessage.set('Nao foi possivel salvar o orcamento. Tente novamente.');
        }
      });
  }

  protected deleteBudget(budget: Budget): void {
    const confirmed = window.confirm(`Deseja excluir o orcamento do cliente "${this.findCustomerName(budget.clienteId)}"?`);

    if (!confirmed) {
      return;
    }

    this.busyBudgetId.set(budget.id);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    this.budgetService
      .delete(budget.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.busyBudgetId.set(null);
          this.budgets.update((items) => items.filter((item) => item.id !== budget.id));
          this.successMessage.set('Orcamento excluido com sucesso.');
        },
        error: () => {
          this.busyBudgetId.set(null);
          this.errorMessage.set('Nao foi possivel excluir o orcamento. Tente novamente.');
        }
      });
  }

  protected viewBudget(budget: Budget): void {
    this.openGeneratedFile(budget.id, 'Html', 'Nao foi possivel abrir a visualizacao do orcamento.');
  }

  protected downloadBudget(budget: Budget): void {
    this.busyBudgetId.set(budget.id);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    this.budgetService
      .generateFile(budget.id, 'Pdf')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.busyBudgetId.set(null);
          this.downloadBlob(response, 'orcamento.pdf');
          this.successMessage.set('Download do orcamento iniciado.');
        },
        error: () => {
          this.busyBudgetId.set(null);
          this.errorMessage.set('Nao foi possivel baixar o orcamento. Tente novamente.');
        }
      });
  }

  protected sendBudgetByEmail(budget: Budget): void {
    this.busyBudgetId.set(budget.id);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    this.budgetService
      .sendByEmail(budget.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          this.busyBudgetId.set(null);
          this.successMessage.set(`Orcamento enviado para a fila de e-mails de ${result.destinatario}.`);
        },
        error: () => {
          this.busyBudgetId.set(null);
          this.errorMessage.set('Nao foi possivel enviar o orcamento por e-mail. Tente novamente.');
        }
      });
  }

  private loadData(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    forkJoin({
      budgets: this.budgetService.getAll(),
      customers: this.customerService.getAll(),
      establishments: this.establishmentService.getAll(),
      vendors: this.vendorService.getAll(),
      templates: this.templateService.getAll(),
      paymentMethods: this.paymentMethodService.getAll(),
      products: this.productService.getAll(),
      serviceItems: this.serviceCatalogService.getAll()
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.loading.set(false);
          this.budgets.set([...data.budgets].sort((left, right) => right.criadoEm.localeCompare(left.criadoEm)));
          this.customers.set(data.customers);
          this.establishments.set(data.establishments);
          this.vendors.set(data.vendors);
          this.templates.set(data.templates);
          this.paymentMethods.set(data.paymentMethods);
          this.products.set(data.products);
          this.serviceItems.set(data.serviceItems);
        },
        error: () => {
          this.loading.set(false);
          this.errorMessage.set('Nao foi possivel carregar os orcamentos. Atualize a pagina e tente novamente.');
        }
      });
  }

  private openModalWithBudget(budgetId: string, mode: Exclude<BudgetModalMode, 'create'>): void {
    this.busyBudgetId.set(budgetId);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    this.budgetService
      .getById(budgetId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (budget) => {
          this.busyBudgetId.set(null);
          this.modalState.set({
            mode,
            budgetId: mode === 'edit' ? budget.id : null,
            value: this.toFormValue(budget)
          });
        },
        error: () => {
          this.busyBudgetId.set(null);
          this.errorMessage.set('Nao foi possivel carregar os dados do orcamento. Tente novamente.');
        }
      });
  }

  private toFormValue(budget: Budget): BudgetFormValue {
    return {
      estabelecimentoId: budget.estabelecimentoId,
      clienteId: budget.clienteId,
      vendedorId: budget.vendedorId,
      templateOrcamentoId: budget.templateOrcamentoId,
      observacoes: budget.observacoes ?? '',
      formaPagamentoIds: budget.formasPagamento.map((item) => item.formaPagamentoId),
      itens: budget.itens.map((item) => ({
        tipo: item.produtoId ? 'produto' : 'servico',
        referenciaId: item.produtoId ?? item.servicoId ?? '',
        quantidade: this.formatDecimal(item.quantidade),
        valorUnitario: this.formatMoney(item.valorUnitario)
      }))
    };
  }

  private openGeneratedFile(id: string, fileType: BudgetFileType, errorMessage: string): void {
    this.busyBudgetId.set(id);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    this.budgetService
      .generateFile(id, fileType)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.busyBudgetId.set(null);
          const blob = response.body;

          if (!blob) {
            this.errorMessage.set(errorMessage);
            return;
          }

          const url = window.URL.createObjectURL(blob);
          const popup = window.open(url, '_blank', 'noopener,noreferrer');

          if (!popup) {
            this.errorMessage.set(errorMessage);
            window.URL.revokeObjectURL(url);
            return;
          }

          setTimeout(() => window.URL.revokeObjectURL(url), 60_000);
        },
        error: () => {
          this.busyBudgetId.set(null);
          this.errorMessage.set(errorMessage);
        }
      });
  }

  private downloadBlob(response: HttpResponse<Blob>, fallbackFileName: string): void {
    const blob = response.body;
    if (!blob) {
      return;
    }

    const fileName = this.extractFileName(response) ?? fallbackFileName;
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement('a');

    anchor.href = url;
    anchor.download = fileName;
    anchor.click();

    setTimeout(() => {
      window.URL.revokeObjectURL(url);
      anchor.remove();
    }, 0);
  }

  private extractFileName(response: HttpResponse<Blob>): string | null {
    const disposition = response.headers.get('content-disposition');
    if (!disposition) {
      return null;
    }

    const match = disposition.match(/filename\*?=(?:UTF-8'')?\"?([^\";]+)\"?/i);
    return match?.[1] ? decodeURIComponent(match[1]) : null;
  }

  private findCustomerName(customerId: string): string {
    return this.customers().find((item) => item.id === customerId)?.nome ?? '-';
  }

  private findEstablishmentName(establishmentId: string): string {
    const establishment = this.establishments().find((item) => item.id === establishmentId);
    return establishment?.nomeFantasia?.trim() || establishment?.razaoSocial || '-';
  }

  private findVendorName(vendorId: string): string {
    return this.vendors().find((item) => item.id === vendorId)?.nome ?? '-';
  }

  private findTemplateTitle(templateId: string): string {
    return this.templates().find((item) => item.id === templateId)?.titulo ?? '-';
  }

  private formatDate(value: string): string {
    return new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short'
    }).format(new Date(value));
  }

  private formatMoney(value: number): string {
    return value.toFixed(2).replace('.', ',');
  }

  private formatDecimal(value: number): string {
    return Number.isInteger(value) ? `${value}` : value.toString().replace('.', ',');
  }
}
