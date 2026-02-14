import {useTranslate} from "@/src/contexts/translation-context";
import {FinanceCategory} from "../../types";
import * as yup from "yup";

export interface BillFormValues {
  description: string;
  category: FinanceCategory | null;
  totalAmount: string;
  recurrenceType: string;
  recurrenceInterval: string;
  recurrenceCount: string;
  dueDate: string;
}

export function useBillFormConfig() {
  const {translate} = useTranslate();

  const schema = yup.object().shape({
    description: yup.string().required().label(translate("finance.bills.fields.description")),
    totalAmount: yup.string().required().test("positive", translate("finance.bills.errors.amountMustBePositive"), (v) => Number(v) > 0),
    recurrenceType: yup.string().required(),
    recurrenceCount: yup.string().when("recurrenceType", {
      is: (v: string) => v === "installment" || v === "recurring",
      then: (s) => s.required().test("min", translate("finance.bills.errors.countMinOne"), (v) => Number(v) >= 1),
    }),
    recurrenceInterval: yup.string().when("recurrenceType", {
      is: "recurring",
      then: (s) => s.required(),
    }),
    dueDate: yup.string().required().label(translate("finance.bills.fields.dueDate")),
  });

  const defaultValues: BillFormValues = {
    description: "",
    category: null,
    totalAmount: "0",
    recurrenceType: "none",
    recurrenceInterval: "monthly",
    recurrenceCount: "1",
    dueDate: new Date().toISOString().split("T")[0],
  };

  return {schema, defaultValues};
}
