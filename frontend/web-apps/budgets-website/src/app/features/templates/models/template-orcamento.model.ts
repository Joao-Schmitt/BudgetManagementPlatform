export interface TemplateOrcamento {
  id: string;
  titulo: string;
  descricao: string;
  html: string;
  ativo: boolean;
  criadoEm: string;
}

export interface TemplateOrcamentoMacro {
  id: string;
  macro: string;
  descricao: string;
}

export interface TemplateOrcamentoUpsertRequest {
  titulo: string;
  descricao?: string;
  html: string;
}

export interface TemplateOrcamentoFormValue {
  titulo: string;
  descricao: string;
  html: string;
}
