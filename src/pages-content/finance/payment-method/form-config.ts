import {useTranslate} from "@/src/contexts/translation-context";
import * as yup from "yup";
import {BankAccountOption} from "./types";

export interface PaymentMethodFormValues {
  name: string;
  bank_account: BankAccountOption | null;
}

export function usePaymentMethodFormConfig() {
  const {translate} = useTranslate();

  const schema = yup.object().shape({
    name: yup.string().required().label(translate("finance.paymentMethod.fields.name")),
  });

  const defaultValues: PaymentMethodFormValues = {
    name: "",
    bank_account: null,
  };

  return {schema, defaultValues};
}
