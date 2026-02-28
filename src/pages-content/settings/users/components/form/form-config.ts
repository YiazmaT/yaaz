import {ImageInputValue} from "@/src/components/form-fields/image-input/types";
import {useTranslate} from "@/src/contexts/translation-context";
import {validEmailRegex} from "@/src/utils/regex";
import * as yup from "yup";

export interface UserFormValues {
  name: string;
  login: string;
  admin: boolean;
  image: ImageInputValue;
}

export function useUserFormConfig(_isEdit: boolean) {
  const {translate} = useTranslate();

  const schema = yup.object().shape({
    name: yup.string().required().label(translate("users.fields.name")),
    login: yup
      .string()
      .required()
      .matches(validEmailRegex, {message: translate("global.errors.invalidEmail")})
      .label(translate("global.email")),
  });

  const defaultValues: UserFormValues = {
    name: "",
    login: "",
    admin: false,
    image: null,
  };

  return {schema, defaultValues};
}
