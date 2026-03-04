export interface SalesPerProductFilters {
  dateFrom: string;
  dateTo: string;
}

export interface SelectedProduct {
  id: string;
  name: string;
  code: number;
  image: string | null;
}

export interface SalesPerProductRow {
  productId: string;
  code: number;
  name: string;
  image: string | null;
  salesCount: number;
  quantitySold: string;
  revenue: string;
  profit: string;
}

export interface SalesPerProductData {
  rows: SalesPerProductRow[];
}

export interface SalesPerProductResultProps {
  data: SalesPerProductData;
  filters: SalesPerProductFilters;
  allProducts: boolean;
  products: SelectedProduct[];
}
