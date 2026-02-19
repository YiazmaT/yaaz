import {Bill} from "../../types";

export interface BillsTableConfigProps {
  onEdit: (row: Bill) => void;
  onDelete: (row: Bill) => void;
  onPay: (row: Bill) => void;
  onCancelPayment: (row: Bill) => void;
}
