import {useIngredients} from "../../use-ingredients";

export interface FormProps {
  ingredients: ReturnType<typeof useIngredients>;
  imageSize?: number;
}
