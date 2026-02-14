import {BankAccount, BillInstallment} from "../../../types";

export interface PayModalProps {
  installment: BillInstallment | null;
  onClose: () => void;
  onSuccess: () => void;
}

export interface PayFormValues {
  bankAccount: BankAccount | null;
  paidDate: string;
}
