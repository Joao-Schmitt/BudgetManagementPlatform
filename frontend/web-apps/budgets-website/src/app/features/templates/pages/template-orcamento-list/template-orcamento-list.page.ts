import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import {
  EntityGridColumn,
  EntityGridComponent,
  EntityGridRow
} from '../../../../shared/components/entity-grid/entity-grid.component';
import { TemplateOrcamentoFormModalComponent } from '../../components/template-orcamento-form-modal/template-orcamento-form-modal.component';
import {
  TemplateOrcamento,
  TemplateOrcamentoFormValue,
  TemplateOrcamentoUpsertRequest
} from '../../models/template-orcamento.model';
import { TemplateOrcamentoService } from '../../services/template-orcamento.service';

type TemplateOrcamentoModalMode = 'create' | 'edit' | 'duplicate';

interface TemplateOrcamentoModalState {
  mode: TemplateOrcamentoModalMode;
  templateOrcamentoId: string | null;
  value: TemplateOrcamentoFormValue | null;
}

@Component({
  selector: 'app-template-orcamento-list-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, EntityGridComponent, TemplateOrcamentoFormModalComponent],
  templateUrl: './template-orcamento-list.page.html',
  styleUrl: './template-orcamento-list.page.scss'
})
export class TemplateOrcamentoListPage {
  private readonly templateOrcamentoService = inject(TemplateOrcamentoService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly templatesOrcamento = signal<TemplateOrcamento[]>([]);
  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly busyTemplateOrcamentoId = signal<string | null>(null);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly modalState = signal<TemplateOrcamentoModalState | null>(null);

  protected readonly gridColumns: EntityGridColumn[] = [
    { key: 'titulo', label: 'Titulo' },
    { key: 'descricao', label: 'Descricao' },
    { key: 'html', label: 'HTML' },
    { key: 'criadoEm', label: 'Criado em' }
  ];

  protected readonly templateCountLabel = computed(() => {
    const count = this.templatesOrcamento().length;
    return count === 1 ? '1 template ativo' : `${count} templates ativos`;
  });

  protected readonly gridRows = computed<EntityGridRow<TemplateOrcamento>[]>(() =>
    this.templatesOrcamento().map((templateOrcamento) => ({
      id: templateOrcamento.id,
      item: templateOrcamento,
      cells: {
        titulo: templateOrcamento.titulo,
        descricao: templateOrcamento.descricao || '-',
        html: this.summarizeHtml(templateOrcamento.html),
        criadoEm: this.formatDate(templateOrcamento.criadoEm)
      }
    }))
  );

  protected readonly modalTitle = computed(() => {
    const state = this.modalState();

    switch (state?.mode) {
      case 'edit':
        return 'Editar template';
      case 'duplicate':
        return 'Duplicar template';
      default:
        return 'Novo template';
    }
  });

  protected readonly modalInitialValue = computed(() => this.modalState()?.value ?? null);

  constructor() {
    this.loadTemplatesOrcamento();
  }

  protected openCreateModal(): void {
    this.errorMessage.set(null);
    this.modalState.set({
      mode: 'create',
      templateOrcamentoId: null,
      value: null
    });
  }

  protected openEditModal(templateOrcamentoId: string): void {
    this.openModalWithTemplateOrcamento(templateOrcamentoId, 'edit');
  }

  protected openDuplicateModal(templateOrcamentoId: string): void {
    this.openModalWithTemplateOrcamento(templateOrcamentoId, 'duplicate');
  }

  protected viewTemplateOrcamento(templateOrcamento: TemplateOrcamento): void {
    const popup = window.open('', '_blank');

    if (!popup) {
      this.errorMessage.set('Nao foi possivel abrir a visualizacao do template.');
      return;
    }

    popup.document.open();
    popup.document.write(templateOrcamento.html);
    popup.document.title = templateOrcamento.titulo;
    popup.document.close();
    popup.focus();
  }

  protected closeModal(): void {
    if (this.saving()) {
      return;
    }

    this.modalState.set(null);
  }

  protected saveTemplateOrcamento(request: TemplateOrcamentoUpsertRequest): void {
    const modalState = this.modalState();

    if (!modalState || this.saving()) {
      return;
    }

    this.saving.set(true);
    this.errorMessage.set(null);

    const request$ =
      modalState.mode === 'edit' && modalState.templateOrcamentoId
        ? this.templateOrcamentoService.update(modalState.templateOrcamentoId, request)
        : this.templateOrcamentoService.create(request);

    request$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (templateOrcamento) => {
          this.saving.set(false);
          this.modalState.set(null);

          if (modalState.mode === 'edit') {
            this.templatesOrcamento.update((items) =>
              items
                .map((item) => (item.id === templateOrcamento.id ? templateOrcamento : item))
                .sort((left, right) => left.titulo.localeCompare(right.titulo, 'pt-BR'))
            );
            return;
          }

          this.templatesOrcamento.update((items) =>
            [...items, templateOrcamento].sort((left, right) => left.titulo.localeCompare(right.titulo, 'pt-BR'))
          );
        },
        error: () => {
          this.saving.set(false);
          this.errorMessage.set('Nao foi possivel salvar o template. Tente novamente.');
        }
      });
  }

  protected deleteTemplateOrcamento(templateOrcamento: TemplateOrcamento): void {
    const confirmed = window.confirm(`Deseja excluir o template "${templateOrcamento.titulo}"?`);

    if (!confirmed) {
      return;
    }

    this.busyTemplateOrcamentoId.set(templateOrcamento.id);
    this.errorMessage.set(null);

    this.templateOrcamentoService
      .delete(templateOrcamento.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.busyTemplateOrcamentoId.set(null);
          this.templatesOrcamento.update((items) => items.filter((item) => item.id !== templateOrcamento.id));
        },
        error: () => {
          this.busyTemplateOrcamentoId.set(null);
          this.errorMessage.set('Nao foi possivel excluir o template. Tente novamente.');
        }
      });
  }

  protected rowBusy(templateOrcamentoId: string): boolean {
    return this.busyTemplateOrcamentoId() === templateOrcamentoId;
  }

  private loadTemplatesOrcamento(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.templateOrcamentoService
      .getAll()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (items) => {
          this.loading.set(false);
          this.templatesOrcamento.set([...items].sort((left, right) => left.titulo.localeCompare(right.titulo, 'pt-BR')));
        },
        error: () => {
          this.loading.set(false);
          this.errorMessage.set('Nao foi possivel carregar os templates. Atualize a pagina e tente novamente.');
        }
      });
  }

  private openModalWithTemplateOrcamento(
    templateOrcamentoId: string,
    mode: Exclude<TemplateOrcamentoModalMode, 'create'>
  ): void {
    this.busyTemplateOrcamentoId.set(templateOrcamentoId);
    this.errorMessage.set(null);

    this.templateOrcamentoService
      .getById(templateOrcamentoId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (templateOrcamento) => {
          this.busyTemplateOrcamentoId.set(null);
          this.modalState.set({
            mode,
            templateOrcamentoId: mode === 'edit' ? templateOrcamento.id : null,
            value: this.toFormValue(templateOrcamento)
          });
        },
        error: () => {
          this.busyTemplateOrcamentoId.set(null);
          this.errorMessage.set('Nao foi possivel carregar os dados do template. Tente novamente.');
        }
      });
  }

  private toFormValue(templateOrcamento: TemplateOrcamento): TemplateOrcamentoFormValue {
    return {
      titulo: templateOrcamento.titulo,
      descricao: templateOrcamento.descricao ?? '',
      html: templateOrcamento.html
    };
  }

  private summarizeHtml(html: string): string {
    const compact = html.replace(/\s+/g, ' ').trim();

    if (!compact) {
      return '-';
    }

    return compact.length > 90 ? `${compact.slice(0, 90)}...` : compact;
  }

  private formatDate(value: string): string {
    if (!value) {
      return '-';
    }

    return new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short'
    }).format(new Date(value));
  }
}
