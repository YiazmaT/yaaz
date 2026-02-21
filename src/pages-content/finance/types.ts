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
  receipt_url?: string;
  active: boolean;
}

export enum BillStatusEnum {
  pending = "pending",
  paid = "paid",
  overdue = "overdue",
}

export interface Nfe {
  id: string;
  code: number;
  description: string;
  supplier?: string;
  nfe_number?: string;
  date: string;
  total_amount: number;
  file_url?: string;
  stock_added: boolean;
  bank_deducted: boolean;
  bank_account_id?: string;
  bank_account?: BankAccount;
  bank_transaction_id?: string;
  active: boolean;
  items: NfeItem[];
  _count?: {items: number};
}

export interface NfeItem {
  id: string;
  nfe_id: string;
  item_type: "ingredient" | "product" | "package";
  ingredient_id?: string;
  product_id?: string;
  package_id?: string;
  ingredient?: {id: string; name: string; image: string | null; unit_of_measure: string};
  product?: {id: string; name: string; image: string | null};
  package?: {id: string; name: string; image: string | null};
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface CategoriesFilters {
  showInactives?: boolean;
}

export interface BankAccountsFilters {
  showInactives?: boolean;
}