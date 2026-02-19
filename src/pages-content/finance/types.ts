export interface FinanceCategory {
  id: string;
  name: string;
  active: boolean;
}

export interface BankAccount {
  id: string;
  name: string;
  balance: number;
  active: boolean;
}

export interface BankTransaction {
  id: string;
  bank_account_id: string;
  type: string;
  amount: number;
  description?: string;
  date: string;
  category_id?: string;
  category?: FinanceCategory;
  bill_id?: string;
  bill?: Bill;
}

export interface Bill {
  id: string;
  code: number;
  description: string;
  category_id?: string;
  category?: FinanceCategory;
  amount: number;
  due_date: string;
  installment_number: number;
  installment_count: number;
  status: string;
  paid_date?: string;
  bank_account_id?: string;
  bank_account?: BankAccount;
  active: boolean;
}

export enum BillStatusEnum {
  pending = "pending",
  paid = "paid",
}

export interface CategoriesFilters {
  showInactives?: boolean;
}

export interface BankAccountsFilters {
  showInactives?: boolean;
}

export enum FinanceTab {
  BILLS = 0,
  BANK = 1,
  CATEGORIES = 2,
}
