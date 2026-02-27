export interface MovementFilters {
  dateFrom: string;
  dateTo: string;
}

export interface MovementBillRow {
  category: string;
  total: string;
}

export interface MovementSaleRow {
  paymentMethod: string;
  total: string;
}

export interface MovementData {
  bills: MovementBillRow[];
  sales: MovementSaleRow[];
  totalBills: string;
  totalSales: string;
  balance: string;
}

export interface MovementResultProps {
  data: MovementData;
  filters: MovementFilters;
}
