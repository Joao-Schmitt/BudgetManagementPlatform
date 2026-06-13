export interface Customer {
  id: string;
  nome: string;
  documento?: string | null;
  email?: string | null;
  telefone?: string | null;
  whatsApp?: string | null;
  cep?: string | null;
  logradouro?: string | null;
  numero?: string | null;
  complemento?: string | null;
  bairro?: string | null;
  cidade?: string | null;
  uf?: string | null;
  observacao?: string | null;
  ativo: boolean;
  criadoEm: string;
}

export interface CustomerUpsertRequest {
  nome: string;
  documento?: string;
  email?: string;
  telefone?: string;
  whatsApp?: string;
  cep?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  uf?: string;
  observacao?: string;
}

export interface CustomerFormValue {
  nome: string;
  documento: string;
  email: string;
  telefone: string;
  whatsApp: string;
  cep: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  uf: string;
  observacao: string;
}
