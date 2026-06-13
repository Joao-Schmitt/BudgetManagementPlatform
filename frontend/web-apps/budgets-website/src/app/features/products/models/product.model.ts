export interface Product {
  id: string;
  codigo?: string | null;
  nome: string;
  descricao?: string | null;
  unidade: string;
  valorVenda: number;
  custo?: number | null;
  ativo: boolean;
  criadoEm: string;
}

export interface ProductUpsertRequest {
  codigo?: string;
  nome: string;
  descricao?: string;
  unidade?: string;
  valorVenda: number;
  custo?: number;
}

export interface ProductFormValue {
  codigo: string;
  nome: string;
  descricao: string;
  unidade: string;
  valorVenda: string;
  custo: string;
}
