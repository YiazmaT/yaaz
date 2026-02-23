export interface TodaySalesResponse {
  total: number;
  count: number;
  averageTicket: number;
  approximateCost: number;
  approximateProfit: number;
}

export interface WeeklySalesResponse {
  days: number[];
  weekStart: string;
  weekEnd: string;
  count: number;
  averageTicket: number;
  approximateCost: number;
  approximateProfit: number;
}

export interface DaySalesData {
  day: number;
  total: number;
}

export interface MonthlySalesResponse {
  days: DaySalesData[];
  count: number;
  averageTicket: number;
  approximateCost: number;
  approximateProfit: number;
}

export interface MonthSalesData {
  label: string;
  total: number;
}

export interface SemestralSalesResponse {
  months: MonthSalesData[];
  count: number;
  averageTicket: number;
  approximateCost: number;
  approximateProfit: number;
}

export interface MonthProcessingData {
  month: number;
  year: number;
  total: number;
  label: string;
}

export interface StockAlertItem {
  id: string;
  code: number;
  name: string;
  stock: number;
  min_stock: number;
}

export interface StockAlertsResponse {
  products: StockAlertItem[];
  ingredients: StockAlertItem[];
  packages: StockAlertItem[];
}

export interface StockAlertRow {
  id: string;
  code: number;
  name: string;
  stock: number;
  min_stock: number;
}

export interface BillAlertItem {
  id: string;
  code: number;
  description: string;
  amount: number;
  due_date: string;
  category: {name: string} | null;
}

export interface BillsAlertsResponse {
  overdue: BillAlertItem[];
  dueToday: BillAlertItem[];
}
