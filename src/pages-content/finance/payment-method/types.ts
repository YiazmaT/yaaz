export interface PaymentMethod {
  id: string;
  name: string;
  active: boolean;
  bank_account_id: string | null;
  bank_account_name: string | null;
}

export interface BankAccountOption {
  id: string;
  name: string;
}

export interface PaymentMethodFilters {
  showInactives?: boolean;
}
