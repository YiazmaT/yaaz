import {BankAccount} from "../bank-accounts/types";
import {FinanceCategory} from "../categories/types";

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
