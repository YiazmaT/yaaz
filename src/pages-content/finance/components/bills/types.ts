import {BillInstallment} from "../../types";

export interface BillsTableConfigProps {
  onEdit: (row: BillInstallment) => void;
  onDelete: (row: BillInstallment) => void;
  onPay: (row: BillInstallment) => void;
  onCancelPayment: (row: BillInstallment) => void;
}
