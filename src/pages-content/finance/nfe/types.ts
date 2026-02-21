import {BankAccount} from "../bank-accounts/types";

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
