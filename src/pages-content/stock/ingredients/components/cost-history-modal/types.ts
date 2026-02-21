export interface CostHistoryModalProps {
  open: boolean;
  onClose: () => void;
  ingredientId: string;
  ingredientName: string;
}

export interface CostHistoryItem {
  id: string;
  date: string;
  costPerUnit: number;
}

export interface CostHistoryResponse {
  data: CostHistoryItem[];
}
