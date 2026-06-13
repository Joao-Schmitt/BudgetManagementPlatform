export interface PaymentMethod {
  id: string;
  nome: string;
  tipo: string;
  ativo: boolean;
}

export interface PaymentMethodUpsertRequest {
  nome: string;
  tipo: string;
}

export interface PaymentMethodFormValue {
  nome: string;
  tipo: string;
}
