export interface StockHistoryModalProps {
  open: boolean;
  onClose: () => void;
  ingredientId: string;
  ingredientName: string;
  unitOfMeasure: string;
}

export interface StockHistoryItem {
  id: string;
  type: "stock_change" | "stock_cost";
  amount: number;
  reason: string | null;
  comment: string | null;
  date: string;
  userName: string | null;
}

export interface StockHistoryResponse {
  history: StockHistoryItem[];
}
