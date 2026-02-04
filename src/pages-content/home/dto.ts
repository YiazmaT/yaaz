export interface TodaySalesResponse {
  total: number;
  count: number;
  averageTicket: number;
}

export interface WeeklySalesResponse {
  days: number[];
  weekStart: string;
  weekEnd: string;
  count: number;
  averageTicket: number;
}

export interface DaySalesData {
  day: number;
  total: number;
}

export interface MonthlySalesResponse {
  days: DaySalesData[];
  count: number;
  averageTicket: number;
}

export interface MonthSalesData {
  label: string;
  total: number;
}

export interface SemestralSalesResponse {
  months: MonthSalesData[];
  count: number;
  averageTicket: number;
}

export interface MonthProcessingData {
  month: number;
  year: number;
  total: number;
  label: string;
}

export interface StockAlertItem {
  id: string;
  name: string;
  stock: number;
  min_stock: number;
}

export interface StockAlertsResponse {
  products: StockAlertItem[];
  ingredients: StockAlertItem[];
  packages: StockAlertItem[];
}
