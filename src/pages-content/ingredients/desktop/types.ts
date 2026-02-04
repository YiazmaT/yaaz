import {TableConfigProps} from "@/src/@types/global-types";
import {Ingredient} from "../types";
import {useIngredients} from "../use-ingredients";

export interface DesktopViewProps {
  ingredients: ReturnType<typeof useIngredients>;
}

export interface IngredientsTableConfigProps extends TableConfigProps<Ingredient> {
  onCostClick?: (row: Ingredient) => void;
  onStockChange: (row: Ingredient) => void;
  onStockHistoryClick: (row: Ingredient) => void;
}
