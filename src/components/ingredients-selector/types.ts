export interface CompositionIngredient {
  id: string;
  code: number;
  name: string;
  description: string | null;
  image: string | null;
  unit_of_measure: string;
  active?: boolean;
}

export interface CompositionItem {
  ingredient: CompositionIngredient;
  quantity: string;
  cost?: string;
}

export interface IngredientsSelectorProps {
  value: CompositionItem[];
  onChange: (value: CompositionItem[]) => void;
  disabled?: boolean;
  showCostField?: boolean;
}

export interface IngredientRowProps {
  item: CompositionItem;
  handleQuantityChange: (ingredientId: string, quantity: string) => void;
  handleCostChange?: (ingredientId: string, cost: string) => void;
  disabled?: boolean;
  handleRemove: (ingredientId: string) => void;
  showCostField?: boolean;
}
