import {ImageInputValue} from "@/src/components/form-fields/image-input/types";
import {useTranslate} from "@/src/contexts/translation-context";
import * as yup from "yup";
import {PackageType} from "./types";
import {UnityOfMeasure} from "../unity-of-measure/types";

export interface PackageFormValues {
  name: string;
  description: string;
  image: ImageInputValue;
  type: PackageType;
  min_stock: string;
  unitOfMeasure: UnityOfMeasure | null;
}

export function usePackageFormConfig() {
  const {translate} = useTranslate();

  const schema = yup.object().shape({
    name: yup.string().required().label(translate("packages.fields.name")),
    type: yup.string().required().label(translate("packages.fields.type")),
    unitOfMeasure: yup.object().required().label(translate("packages.fields.unityOfMeasure")),
  });

  const defaultValues: PackageFormValues = {
    name: "",
    description: "",
    image: null,
    type: PackageType.product,
    min_stock: "0",
    unitOfMeasure: null,
  };

  return {
    schema,
    defaultValues,
  };
}
