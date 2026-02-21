import {UnityOfMeasure} from "@/src/pages-content/stock/unity-of-measure/types";

export interface CompositionIngredient {
  id: string;
  code: number;
  name: string;
  description: string | null;
  image: string | null;
  unity_of_measure: UnityOfMeasure | null;
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
  onSelect?: (ingredient: CompositionIngredient) => void;
}

export interface IngredientRowProps {
  item: CompositionItem;
  handleQuantityChange: (ingredientId: string, quantity: string) => void;
  handleCostChange?: (ingredientId: string, cost: string) => void;
  disabled?: boolean;
  handleRemove: (ingredientId: string) => void;
  showCostField?: boolean;
}
