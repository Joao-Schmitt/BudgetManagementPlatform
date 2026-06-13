export interface ServiceItem {
  id: string;
  codigo?: string | null;
  nome: string;
  descricao?: string | null;
  valor: number;
  custo?: number | null;
  ativo: boolean;
  criadoEm: string;
}

export interface ServiceUpsertRequest {
  codigo?: string;
  nome: string;
  descricao?: string;
  valor: number;
  custo?: number;
}

export interface ServiceFormValue {
  codigo: string;
  nome: string;
  descricao: string;
  valor: string;
  custo: string;
}
