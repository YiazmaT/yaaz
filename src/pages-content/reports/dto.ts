interface StockLevelRowDto {
  id: string;
  name: string;
  type: "ingredient" | "product" | "package";
  currentStock: string;
  minStock: string;
  unit: string;
  status: "ok" | "low" | "critical";
}
