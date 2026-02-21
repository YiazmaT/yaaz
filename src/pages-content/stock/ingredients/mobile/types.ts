import {useIngredients} from "../use-ingredients";

export interface MobileViewProps {
  ingredients: ReturnType<typeof useIngredients>;
}
