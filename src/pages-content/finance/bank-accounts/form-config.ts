import {useTranslate} from "@/src/contexts/translation-context";
import * as yup from "yup";

export interface BankAccountFormValues {
  name: string;
  balance: string;
}

export function useBankAccountFormConfig() {
  const {translate} = useTranslate();

  const schema = yup.object().shape({
    name: yup.string().required().label(translate("finance.bank.fields.name")),
  });

  const defaultValues: BankAccountFormValues = {
    name: "",
    balance: "0",
  };

  return {schema, defaultValues};
}
