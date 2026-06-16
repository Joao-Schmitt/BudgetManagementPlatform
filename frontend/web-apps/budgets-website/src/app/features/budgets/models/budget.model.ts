export type BudgetFileType = 'Html' | 'Pdf';
export type BudgetItemType = 'produto' | 'servico';

export interface Budget {
  id: string;
  estabelecimentoId: string;
  clienteId: string;
  vendedorId: string;
  usuarioId: string;
  templateOrcamentoId: string;
  observacoes: string;
  ativo: boolean;
  criadoEm: string;
  atualizadoEm?: string | null;
  formasPagamento: BudgetPaymentMethodLink[];
  itens: BudgetItem[];
}

export interface BudgetPaymentMethodLink {
  id: string;
  orcamentoId: string;
  formaPagamentoId: string;
}

export interface BudgetItem {
  id: string;
  orcamentoId: string;
  produtoId?: string | null;
  servicoId?: string | null;
  quantidade: number;
  valorUnitario: number;
}

export interface BudgetSaveRequest {
  estabelecimentoId: string;
  clienteId: string;
  vendedorId: string;
  usuarioId: string;
  templateOrcamentoId: string;
  observacoes?: string;
  formaPagamentoIds: string[];
  itens: BudgetItemSaveRequest[];
}

export interface BudgetItemSaveRequest {
  produtoId?: string;
  servicoId?: string;
  quantidade: number;
  valorUnitario: number;
}

export interface BudgetFormSubmit {
  estabelecimentoId: string;
  clienteId: string;
  vendedorId: string;
  templateOrcamentoId: string;
  observacoes?: string;
  formaPagamentoIds: string[];
  itens: BudgetItemSaveRequest[];
}

export interface BudgetFormValue {
  estabelecimentoId: string;
  clienteId: string;
  vendedorId: string;
  templateOrcamentoId: string;
  observacoes: string;
  formaPagamentoIds: string[];
  itens: BudgetItemFormValue[];
}

export interface BudgetItemFormValue {
  tipo: BudgetItemType;
  referenciaId: string;
  quantidade: string;
  valorUnitario: string;
}

export interface BudgetOptionItem {
  id: string;
  label: string;
}

export interface BudgetItemOption extends BudgetOptionItem {
  valorPadrao: number;
}

export interface QueueBudgetEmailResult {
  filaEmailId: string;
  destinatario: string;
  fileName: string;
}
