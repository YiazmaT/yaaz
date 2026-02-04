export interface StockLevelsFilters {
  type: StockTypeOption | null;
  belowMinimumOnly: boolean;
}

export interface StockLevelsRow {
  id: string;
  name: string;
  type: "ingredient" | "product" | "package";
  currentStock: string;
  minStock: string;
  unit: string;
  status: "ok" | "low" | "critical";
}

export interface StockTypeOption {
  value: string;
  label: string;
}

export interface StockLevelsResultProps {
  data: StockLevelsRow[];
  filters: StockLevelsFilters;
}
