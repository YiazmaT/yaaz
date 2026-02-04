export enum ReportTab {
  SALES = "sales",
  STOCK = "stock",
}

export enum ReportType {
  SALES_SUMMARY = "sales_summary",
  STOCK_LEVELS = "stock_levels",
  PROFIT_MARGIN = "profit_margin",
}

export interface ReportOption {
  value: ReportType;
  label: string;
  description: string;
}
