import {PaymentMethod} from "../types";

export interface PaymentMethodsTableConfigProps {
  onEdit: (row: PaymentMethod) => void;
  onToggleActive: (row: PaymentMethod) => void;
  onDelete: (row: PaymentMethod) => void;
}
