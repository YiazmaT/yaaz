import {ImageInputValue} from "@/src/components/form-fields/image-input/types";
import {useTranslate} from "@/src/contexts/translation-context";
import * as yup from "yup";
import {UnityOfMeasure} from "../unity-of-measure/types";

export interface IngredientFormValues {
  name: string;
  description: string;
  image: ImageInputValue;
  unitOfMeasure: UnityOfMeasure | null;
  min_stock: string;
}

export function useIngredientFormConfig() {
  const {translate} = useTranslate();

  const schema = yup.object().shape({
    name: yup.string().required().label(translate("ingredients.fields.name")),
    unitOfMeasure: yup.object().required().label(translate("ingredients.fields.unitOfMeasure")),
  });

  const defaultValues: IngredientFormValues = {
    name: "",
    description: "",
    image: null,
    unitOfMeasure: null,
    min_stock: "0",
  };

  return {
    schema,
    defaultValues,
  };
}
