import {ImageInputValue} from "@/src/components/form-fields/image-input/types";
import {useTranslate} from "@/src/contexts/translation-context";
import {CompositionItem, PackageCompositionItem} from "./types";
import * as yup from "yup";

export interface ProductFormValues {
  name: string;
  price: string;
  description: string;
  image: ImageInputValue;
  composition: CompositionItem[];
  packages: PackageCompositionItem[];
  min_stock: string;
}

export function useProductFormConfig() {
  const {translate} = useTranslate();

  const schema = yup.object().shape({
    name: yup.string().required().label(translate("products.fields.name")),
    price: yup.string().required().label(translate("products.fields.price")),
  });

  const defaultValues: ProductFormValues = {
    name: "",
    price: "0",
    description: "",
    image: null,
    composition: [] as CompositionItem[],
    packages: [] as PackageCompositionItem[],
    min_stock: "0",
  };

  return {
    schema,
    defaultValues,
  };
}
