import {useTranslate} from "@/src/contexts/translation-context";
import {validEmailRegex} from "@/src/utils/regex";
import * as yup from "yup";

export interface UserFormValues {
  name: string;
  login: string;
  password: string;
  admin: boolean;
}

export function useUserFormConfig(isEdit: boolean) {
  const {translate} = useTranslate();

  const schema = yup.object().shape({
    name: yup.string().required().label(translate("users.fields.name")),
    login: yup
      .string()
      .required()
      .matches(validEmailRegex, {message: translate("global.errors.invalidEmail")})
      .label(translate("global.email")),
    password: isEdit ? yup.string().optional() : yup.string().required().label(translate("users.fields.password")),
  });

  const defaultValues: UserFormValues = {
    name: "",
    login: "",
    password: "",
    admin: false,
  };

  return {schema, defaultValues};
}
