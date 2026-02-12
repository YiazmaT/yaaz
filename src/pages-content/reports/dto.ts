export interface StockLevelRowDto {
  id: string;
  name: string;
  type: "ingredient" | "product" | "package";
  currentStock: string;
  minStock: string;
  unit: string;
  status: "ok" | "low" | "critical";
}

export const TYPE_LABELS: Record<string, string> = {
  ingredient: "Insumo",
  product: "Produto",
  package: "Embalagem",
};

export const STATUS_LABELS: Record<string, string> = {
  ok: "OK",
  low: "Baixo",
  critical: "Crítico",
};
