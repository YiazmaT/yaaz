import {BankAccount} from "../types";

export interface BankAccountsTableConfigProps {
  onEdit: (row: BankAccount) => void;
  onToggleActive: (row: BankAccount) => void;
  onStatement: (row: BankAccount) => void;
  onDelete: (row: BankAccount) => void;
}
