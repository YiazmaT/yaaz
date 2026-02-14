import {useTranslate} from "@/src/contexts/translation-context";
import * as yup from "yup";
import {FinanceCategory} from "../../../types";

export interface TransactionFormValues {
  type: string;
  amount: string;
  description: string;
  date: string;
  category: FinanceCategory | null;
}

export function useTransactionFormConfig() {
  const {translate} = useTranslate();

  const schema = yup.object().shape({
    type: yup.string().required(),
    amount: yup.string().required().test("positive", translate("finance.bank.errors.amountMustBePositive"), (v) => Number(v) > 0),
    date: yup.string().required().label(translate("finance.bank.fields.date")),
  });

  const defaultValues: TransactionFormValues = {
    type: "deposit",
    amount: "0",
    description: "",
    date: new Date().toISOString().split("T")[0],
    category: null,
  };

  return {schema, defaultValues};
}
