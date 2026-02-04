import {ImageInputValue} from "@/src/components/form-fields/image-input/types";
import {useTranslate} from "@/src/contexts/translation-context";
import * as yup from "yup";

export interface TenantFormValues {
  name: string;
  logo: ImageInputValue;
  primary_color: string;
  secondary_color: string;
}

export function useTenantFormConfig() {
  const {translate} = useTranslate();

  const schema = yup.object().shape({
    name: yup.string().required().label(translate("tenants.fields.name")),
  });

  const defaultValues: TenantFormValues = {
    name: "",
    logo: null,
    primary_color: "",
    secondary_color: "",
  };

  return {
    schema,
    defaultValues,
  };
}
