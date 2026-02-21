import {UnityOfMeasure} from "../unity-of-measure/types";

export enum IngredientStockChangeReason {
  stolen = "stolen",
  expired = "expired",
  damaged = "damaged",
  spillage = "spillage",
  found = "found",
  inventory_correction = "inventory_correction",
  other = "other",
}

export interface Ingredient {
  id: string;
  code: number;
  name: string;
  description: string | null;
  image: string | null;
  unit_of_measure_id: string | null;
  unity_of_measure: UnityOfMeasure | null;
  stock: string;
  min_stock?: string;
  active: boolean;
  costs?: IngredientCost[];
  lastCost?: number | null;
}

export interface IngredientsFilters {
  showInactives?: boolean;
}

export interface IngredientCost {
  id: string;
  ingredient_id: string;
  quantity: string;
  price: string;
  creator_id: string | null;
  creation_date: Date;
}
