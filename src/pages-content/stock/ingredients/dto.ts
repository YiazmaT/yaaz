import {IngredientStockChangeReason} from "./types";

export interface CreateIngredientDto {
  name: string;
  description?: string | null;
  unitOfMeasureId: string;
  image?: File | null;
}

export interface UpdateIngredientDto extends CreateIngredientDto {
  id: string;
}

export interface DeleteIngredientDto {
  id: string;
}

export interface StockItem {
  ingredientId: string;
  quantity: string;
  cost?: string;
}

export interface AddStockDto {
  items: StockItem[];
}

export interface StockChangeDto {
  ingredientId: string;
  newStock: string;
  reason: IngredientStockChangeReason;
  comment?: string;
}
