export interface Vendor {
  id: string;
  estabelecimentoId: string;
  usuarioId?: string | null;
  nome: string;
  email?: string | null;
  telefone?: string | null;
  percentualComissaoPadrao: number;
  ativo: boolean;
  criadoEm: string;
}

export interface VendorUpsertRequest {
  estabelecimentoId: string;
  usuarioId?: string;
  nome: string;
  email?: string;
  telefone?: string;
  percentualComissaoPadrao: number;
}

export interface VendorFormValue {
  estabelecimentoId: string;
  usuarioId: string;
  nome: string;
  email: string;
  telefone: string;
  percentualComissaoPadrao: string;
}

export interface VendorEstablishmentOption {
  id: string;
  label: string;
}
