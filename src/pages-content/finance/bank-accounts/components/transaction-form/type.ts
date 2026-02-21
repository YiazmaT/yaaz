export interface TransactionFormProps {
  show: boolean;
  onClose: () => void;
  bankAccountId: string;
  onSuccess: () => void;
}
