export interface SalesSummaryFilters {
  dateFrom: string;
  dateTo: string;
}

export interface SalesSummaryRow {
  date: string;
  totalSales: string;
  transactionCount: number;
  averageTicket: string;
  cash: string;
  credit: string;
  debit: string;
  pix: string;
  iFood: string;
}

export interface SalesSummaryResultProps {
  data: SalesSummaryRow[];
  filters: SalesSummaryFilters;
}
