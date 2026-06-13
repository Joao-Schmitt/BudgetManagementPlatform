import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { EntityGridColumn, EntityGridComponent, EntityGridRow } from '../../../../shared/components/entity-grid/entity-grid.component';
import { ProductFormModalComponent } from '../../components/product-form-modal/product-form-modal.component';
import { Product, ProductFormValue, ProductUpsertRequest } from '../../models/product.model';
import { ProductService } from '../../services/product.service';

type ProductModalMode = 'create' | 'edit' | 'duplicate';

interface ProductModalState {
  mode: ProductModalMode;
  productId: string | null;
  value: ProductFormValue | null;
}

@Component({
  selector: 'app-product-list-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, EntityGridComponent, ProductFormModalComponent],
  templateUrl: './product-list.page.html',
  styleUrl: './product-list.page.scss'
})
export class ProductListPage {
  private readonly productService = inject(ProductService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly products = signal<Product[]>([]);
  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly busyProductId = signal<string | null>(null);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly modalState = signal<ProductModalState | null>(null);

  protected readonly gridColumns: EntityGridColumn[] = [
    { key: 'codigo', label: 'Codigo' },
    { key: 'nome', label: 'Nome' },
    { key: 'unidade', label: 'Unidade' },
    { key: 'valorVenda', label: 'Valor venda' },
    { key: 'custo', label: 'Custo' },
    { key: 'descricao', label: 'Descricao' }
  ];

  protected readonly productCountLabel = computed(() => {
    const count = this.products().length;
    return count === 1 ? '1 produto ativo' : `${count} produtos ativos`;
  });

  protected readonly gridRows = computed<EntityGridRow<Product>[]>(() =>
    this.products().map((product) => ({
      id: product.id,
      item: product,
      cells: {
        codigo: product.codigo || '-',
        nome: product.nome,
        unidade: product.unidade,
        valorVenda: this.formatCurrency(product.valorVenda),
        custo: product.custo == null ? '-' : this.formatCurrency(product.custo),
        descricao: product.descricao || '-'
      }
    }))
  );

  protected readonly modalTitle = computed(() => {
    const state = this.modalState();

    switch (state?.mode) {
      case 'edit':
        return 'Editar produto';
      case 'duplicate':
        return 'Duplicar produto';
      default:
        return 'Novo produto';
    }
  });

  protected readonly modalInitialValue = computed(() => this.modalState()?.value ?? null);

  constructor() {
    this.loadProducts();
  }

  protected openCreateModal(): void {
    this.errorMessage.set(null);
    this.modalState.set({
      mode: 'create',
      productId: null,
      value: null
    });
  }

  protected openEditModal(productId: string): void {
    this.openModalWithProduct(productId, 'edit');
  }

  protected openDuplicateModal(productId: string): void {
    this.openModalWithProduct(productId, 'duplicate');
  }

  protected closeModal(): void {
    if (this.saving()) {
      return;
    }

    this.modalState.set(null);
  }

  protected saveProduct(request: ProductUpsertRequest): void {
    const modalState = this.modalState();

    if (!modalState || this.saving()) {
      return;
    }

    this.saving.set(true);
    this.errorMessage.set(null);

    const request$ =
      modalState.mode === 'edit' && modalState.productId
        ? this.productService.update(modalState.productId, request)
        : this.productService.create(request);

    request$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (product) => {
          this.saving.set(false);
          this.modalState.set(null);

          if (modalState.mode === 'edit') {
            this.products.update((items) =>
              items
                .map((item) => (item.id === product.id ? product : item))
                .sort((left, right) => left.nome.localeCompare(right.nome, 'pt-BR'))
            );
            return;
          }

          this.products.update((items) =>
            [...items, product].sort((left, right) => left.nome.localeCompare(right.nome, 'pt-BR'))
          );
        },
        error: () => {
          this.saving.set(false);
          this.errorMessage.set('Nao foi possivel salvar o produto. Tente novamente.');
        }
      });
  }

  protected deleteProduct(product: Product): void {
    const confirmed = window.confirm(`Deseja excluir o produto "${product.nome}"?`);

    if (!confirmed) {
      return;
    }

    this.busyProductId.set(product.id);
    this.errorMessage.set(null);

    this.productService
      .delete(product.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.busyProductId.set(null);
          this.products.update((items) => items.filter((item) => item.id !== product.id));
        },
        error: () => {
          this.busyProductId.set(null);
          this.errorMessage.set('Nao foi possivel excluir o produto. Tente novamente.');
        }
      });
  }

  protected rowBusy(productId: string): boolean {
    return this.busyProductId() === productId;
  }

  private loadProducts(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.productService
      .getAll()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (items) => {
          this.loading.set(false);
          this.products.set([...items].sort((left, right) => left.nome.localeCompare(right.nome, 'pt-BR')));
        },
        error: () => {
          this.loading.set(false);
          this.errorMessage.set('Nao foi possivel carregar os produtos. Atualize a pagina e tente novamente.');
        }
      });
  }

  private openModalWithProduct(productId: string, mode: Exclude<ProductModalMode, 'create'>): void {
    this.busyProductId.set(productId);
    this.errorMessage.set(null);

    this.productService
      .getById(productId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (product) => {
          this.busyProductId.set(null);
          this.modalState.set({
            mode,
            productId: mode === 'edit' ? product.id : null,
            value: this.toFormValue(product)
          });
        },
        error: () => {
          this.busyProductId.set(null);
          this.errorMessage.set('Nao foi possivel carregar os dados do produto. Tente novamente.');
        }
      });
  }

  private toFormValue(product: Product): ProductFormValue {
    return {
      codigo: product.codigo ?? '',
      nome: product.nome,
      descricao: product.descricao ?? '',
      unidade: product.unidade,
      valorVenda: product.valorVenda.toString(),
      custo: product.custo == null ? '' : product.custo.toString()
    };
  }

  private formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }
}
