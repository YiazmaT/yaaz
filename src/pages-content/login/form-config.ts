import {useTranslate} from "@/src/contexts/translation-context";
import {validEmailRegex} from "@/src/utils/regex";
import * as yup from "yup";

export function useLoginFormConfig() {
  const {translate} = useTranslate();
  const schema = yup.object().shape({
    login: yup
      .string()
      .required()
      .matches(validEmailRegex, {message: translate("global.errors.invalidEmail")})
      .label(translate("global.email")),
    password: yup.string().required().label(translate("global.password")),
  });

  const defaultValues = {
    login: "",
    password: "",
  };

  return {
    schema,
    defaultValues,
  };
}
