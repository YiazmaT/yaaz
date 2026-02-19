import {useTranslate} from "@/src/contexts/translation-context";
import {FinanceCategory} from "../../types";
import * as yup from "yup";
import moment from "moment";

export interface BillFormValues {
  description: string;
  category: FinanceCategory | null;
  amount: string;
  installmentCount: string;
  dueDate: string;
}

export function useBillFormConfig() {
  const {translate} = useTranslate();

  const schema = yup.object().shape({
    description: yup.string().required().label(translate("finance.bills.fields.description")),
    amount: yup
      .string()
      .required()
      .test("positive", translate("finance.bills.errors.amountMustBePositive"), (v) => Number(v) > 0),
    dueDate: yup.string().required().label(translate("finance.bills.fields.dueDate")),
  });

  const defaultValues: BillFormValues = {
    description: "",
    category: null,
    amount: "0",
    installmentCount: "1",
    dueDate: moment().format("YYYY-MM-DD"),
  };

  return {schema, defaultValues};
}
