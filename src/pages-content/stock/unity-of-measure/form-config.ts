import * as yup from "yup";
import {useTranslate} from "@/src/contexts/translation-context";

export interface UnityOfMeasureFormValues {
  unity: string;
}

export function useUnityOfMeasureFormConfig() {
  const {translate} = useTranslate();

  const schema = yup.object().shape({
    unity: yup.string().required().label(translate("unityOfMeasure.fields.unity")),
  });

  const defaultValues: UnityOfMeasureFormValues = {
    unity: "",
  };

  return {schema, defaultValues};
}
