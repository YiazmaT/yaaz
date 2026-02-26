export interface CreatePaymentMethodDto {
  name: string;
  bank_account_id?: string | null;
}

export interface UpdatePaymentMethodDto {
  id: string;
  name: string;
  bank_account_id?: string | null;
}

export interface TogglePaymentMethodActiveDto {
  id: string;
}

export interface DeletePaymentMethodDto {
  id: string;
}
