import {Bill} from "../bills/types";
import {FinanceCategory} from "../categories/types";

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

export interface BankAccountsFilters {
  showInactives?: boolean;
}
