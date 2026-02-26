export enum ReportTab {
  SALES = "sales",
  STOCK = "stock",
}

export enum ReportType {
  SALES_SUMMARY = "sales_summary",
  STOCK_LEVELS = "stock_levels",
}

export interface ReportOption {
  value: ReportType;
  label: string;
  description: string;
}
