export interface ProfitMarginFilters {
  dateFrom: string;
  dateTo: string;
  product: ProductOption | null;
}

export interface ProfitMarginRow {
  productId: string;
  productName: string;
  quantitySold: number;
  revenue: string;
  cost: string;
  profit: string;
  marginPercent: string;
}

export interface ProductOption {
  id: string;
  name: string;
}

export interface ProfitMarginResultProps {
  data: ProfitMarginRow[];
  filters: ProfitMarginFilters;
}
