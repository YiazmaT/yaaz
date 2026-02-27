export interface SalesSummaryFilters {
  dateFrom: string;
  dateTo: string;
}

export interface SalesSummaryRow {
  date: string;
  totalSales: string;
  transactionCount: number;
  averageTicket: string;
  estimatedProfit: string;
  byPaymentMethod: Record<string, string>;
}

export interface SalesSummaryData {
  paymentMethods: string[];
  rows: SalesSummaryRow[];
}

export interface SalesSummaryResultProps {
  data: SalesSummaryData;
  filters: SalesSummaryFilters;
}
