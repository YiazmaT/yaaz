import {ImageInputValue} from "@/src/components/form-fields/image-input/types";
import {useTranslate} from "@/src/contexts/translation-context";
import {isValidCPF, isValidCNPJ} from "@/src/utils/cpf-cnpj";
import {validEmailRegex} from "@/src/utils/regex";
import * as yup from "yup";

export interface ClientFormValues {
  name: string;
  email: string;
  phone: string;
  cpf: string;
  cnpj: string;
  image: ImageInputValue;
  isCompany: boolean;
}

export function useClientFormConfig() {
  const {translate} = useTranslate();

  const schema = yup.object().shape({
    name: yup.string().required().label(translate("clients.fields.name")),
    email: yup
      .string()
      .matches(validEmailRegex, {message: translate("global.errors.invalidEmail"), excludeEmptyString: true})
      .label(translate("clients.fields.email")),
    cpf: yup.string().test("cpf-valid", translate("clients.errors.invalidCpf"), function (value) {
      if (!value || value.trim() === "") return true;
      if (this.parent.isCompany) return true;
      return isValidCPF(value);
    }),
    cnpj: yup.string().test("cnpj-valid", translate("clients.errors.invalidCnpj"), function (value) {
      if (!value || value.trim() === "") return true;
      if (!this.parent.isCompany) return true;
      return isValidCNPJ(value);
    }),
  });

  const defaultValues: ClientFormValues = {
    name: "",
    email: "",
    phone: "",
    cpf: "",
    cnpj: "",
    image: null,
    isCompany: false,
  };

  return {schema, defaultValues};
}
