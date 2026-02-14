import {useTranslate} from "@/src/contexts/translation-context";
import * as yup from "yup";

export interface CategoryFormValues {
  name: string;
}

export function useCategoryFormConfig() {
  const {translate} = useTranslate();

  const schema = yup.object().shape({
    name: yup.string().required().label(translate("finance.categories.fields.name")),
  });

  const defaultValues: CategoryFormValues = {
    name: "",
  };

  return {schema, defaultValues};
}
