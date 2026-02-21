import {BankAccount} from "../../../bank-accounts/types";
import {Bill} from "../../types";

export interface PayModalProps {
  bill: Bill | null;
  onClose: () => void;
  onSuccess: () => void;
}

export interface PayFormValues {
  bankAccount: BankAccount | null;
  paidDate: string;
}
