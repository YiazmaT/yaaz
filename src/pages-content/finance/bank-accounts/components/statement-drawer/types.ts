import {BankAccount} from "../../types";

export interface StatementDrawerProps {
  account: BankAccount | null;
  onClose: () => void;
  onTableRefresh: () => void;
}
