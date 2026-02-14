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
  bill_installment_id?: string;
  bill_installment?: BillInstallment & {bill: Bill};
}

export interface Bill {
  id: string;
  code: number;
  description: string;
  category_id?: string;
  category?: FinanceCategory;
  total_amount: number;
  recurrence_type: string;
  recurrence_interval?: string;
  recurrence_count?: number;
  active: boolean;
}

export interface BillInstallment {
  id: string;
  bill_id: string;
  installment_number: number;
  amount: number;
  due_date: string;
  status: string;
  paid_date?: string;
  bank_account_id?: string;
  bank_account?: BankAccount;
  bill: Bill;
}

export enum RecurrenceIntervalEnum {
  weekly = "weekly",
  biweekly = "biweekly",
  monthly = "monthly",
  bimonthly = "bimonthly",
  quarterly = "quarterly",
  semiannual = "semiannual",
  annual = "annual",
}

export enum BillStatusEnum {
  pending = "pending",
  paid = "paid",
  overdue = "overdue",
  cancelled = "cancelled",
}

export enum FinanceTab {
  BILLS = 0,
  BANK = 1,
  CATEGORIES = 2,
}
