export interface Establishment {
  id: string;
  razaoSocial: string;
  nomeFantasia?: string | null;
  cnpj?: string | null;
  inscricaoEstadual?: string | null;
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
  logoUrl?: string | null;
  ativo: boolean;
  criadoEm: string;
  atualizadoEm?: string | null;
}

export interface EstablishmentUpsertRequest {
  razaoSocial: string;
  nomeFantasia?: string;
  cnpj?: string;
  inscricaoEstadual?: string;
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
  logoUrl?: string;
}

export interface EstablishmentFormValue {
  razaoSocial: string;
  nomeFantasia: string;
  cnpj: string;
  inscricaoEstadual: string;
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
  logoUrl: string;
}
