export interface CostHistoryModalProps {
  open: boolean;
  onClose: () => void;
  productId: string;
  productName: string;
}

export interface CostHistoryItem {
  id: string;
  date: string;
  costPerUnit: number;
}
