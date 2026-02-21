export interface CostHistoryModalProps {
  open: boolean;
  onClose: () => void;
  packageId: string;
  packageName: string;
}

export interface CostHistoryItem {
  id: string;
  date: string;
  costPerUnit: number;
}

export interface CostHistoryResponse {
  data: CostHistoryItem[];
}
