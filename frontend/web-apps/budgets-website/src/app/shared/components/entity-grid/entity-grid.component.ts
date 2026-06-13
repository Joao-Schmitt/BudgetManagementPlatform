import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCopy, lucidePencil, lucidePlus, lucideTrash2 } from '@ng-icons/lucide';

import { ZardButtonComponent } from '@/shared/components/button/button.component';
import { ZardCardComponent } from '@/shared/components/card/card.component';
import { ZardSkeletonComponent } from '@/shared/components/skeleton/skeleton.component';
import { ZardTableImports } from '@/shared/components/table/table.imports';

export type GridRowId = string | number;

export interface EntityGridColumn {
  key: string;
  label: string;
}

export interface EntityGridRow<TItem> {
  id: GridRowId;
  item: TItem;
  cells: Record<string, string>;
}

@Component({
  selector: 'app-entity-grid',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, NgIcon, ZardButtonComponent, ZardCardComponent, ZardSkeletonComponent, ZardTableImports],
  templateUrl: './entity-grid.component.html',
  styleUrl: './entity-grid.component.scss',
  viewProviders: [provideIcons({ lucideCopy, lucidePencil, lucidePlus, lucideTrash2 })]
})
export class EntityGridComponent<TItem extends { id: GridRowId }> {
  readonly eyebrow = input('Cadastro');
  readonly title = input.required<string>();
  readonly summary = input<string | null>(null);
  readonly addLabel = input('Adicionar');
  readonly loading = input(false);
  readonly emptyTitle = input('Nenhum registro encontrado');
  readonly emptyDescription = input('Use o botao acima para adicionar o primeiro registro.');
  readonly columns = input<EntityGridColumn[]>([]);
  readonly rows = input<EntityGridRow<TItem>[]>([]);
  readonly busyRowId = input<GridRowId | null>(null);

  readonly add = output<void>();
  readonly edit = output<TItem>();
  readonly duplicate = output<TItem>();
  readonly delete = output<TItem>();

  protected isBusy(rowId: GridRowId): boolean {
    return this.busyRowId() === rowId;
  }

  protected trackColumn = (_index: number, column: EntityGridColumn): string => column.key;
  protected trackRow = (_index: number, row: EntityGridRow<TItem>): GridRowId => row.id;
}
