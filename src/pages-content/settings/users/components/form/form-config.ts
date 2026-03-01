import {ImageInputValue} from "@/src/components/form-fields/image-input/types";
import {useTranslate} from "@/src/contexts/translation-context";
import {validEmailRegex} from "@/src/utils/regex";
import * as yup from "yup";

export interface UserGroupOption {
  id: string;
  name: string;
}

export interface UserFormValues {
  name: string;
  login: string;
  admin: boolean;
  is_owner: boolean;
  image: ImageInputValue;
  user_group: UserGroupOption | null;
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
    user_group: yup
      .object()
      .nullable()
      .when(["admin", "is_owner"], {
        is: (admin: boolean, isOwner: boolean) => !admin && !isOwner,
        then: (s) => s.required().label(translate("users.fields.group")),
        otherwise: (s) => s.nullable(),
      }),
  });

  const defaultValues: UserFormValues = {
    name: "",
    login: "",
    admin: false,
    is_owner: false,
    image: null,
    user_group: null,
  };

  return {schema, defaultValues};
}
