export enum ReportTab {
  SALES = "sales",
  FINANCE = "finance",
}

export enum ReportType {
  SALES_SUMMARY = "sales_summary",
  MOVEMENT = "movement",
}

export interface ReportOption {
  value: ReportType;
  label: string;
  description: string;
}
