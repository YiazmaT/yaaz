export enum ReportTab {
  SALES = "sales",
}

export enum ReportType {
  SALES_SUMMARY = "sales_summary",
}

export interface ReportOption {
  value: ReportType;
  label: string;
  description: string;
}
