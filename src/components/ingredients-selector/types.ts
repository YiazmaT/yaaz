import {Ingredient} from "@/src/pages-content/stock/ingredients/types";

export interface CompositionItem {
  ingredient: Ingredient;
  quantity: string;
  cost?: string;
}

export interface IngredientsSelectorProps {
  value: CompositionItem[];
  onChange: (value: CompositionItem[]) => void;
  disabled?: boolean;
  showCostField?: boolean;
  onSelect?: (ingredient: Ingredient) => void;
}

export interface IngredientRowProps {
  item: CompositionItem;
  handleQuantityChange: (ingredientId: string, quantity: string) => void;
  handleCostChange?: (ingredientId: string, cost: string) => void;
  disabled?: boolean;
  handleRemove: (ingredientId: string) => void;
  showCostField?: boolean;
}
