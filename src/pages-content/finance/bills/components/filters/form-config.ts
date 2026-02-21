import {useTranslate} from "@/src/contexts/translation-context";
import {BillsFilterFormValues} from "./types";
import * as yup from "yup";

export function useBillsFilterFormConfig() {
  const {translate} = useTranslate();

  const schema = yup.object().shape({
    categoryId: yup.string(),
    dueDateFrom: yup.string().test("from-before-to", translate("finance.bills.filters.dateFromGreaterThanTo"), function (value) {
      const {dueDateTo} = this.parent;
      if (!value || !dueDateTo) return true;
      return value <= dueDateTo;
    }),
    dueDateTo: yup.string(),
    valueFrom: yup.string().test("from-before-to", translate("finance.bills.filters.valueFromGreaterThanTo"), function (value) {
      const {valueTo} = this.parent;
      const fromValue = parseFloat(value || "0");
      const toValue = parseFloat(valueTo || "0");
      if (fromValue === 0 || toValue === 0) return true;
      return fromValue <= toValue;
    }),
    valueTo: yup.string(),
    status: yup.string(),
  });

  const defaultValues: BillsFilterFormValues = {
    categoryId: "",
    dueDateFrom: "",
    dueDateTo: "",
    valueFrom: "0",
    valueTo: "0",
    status: "",
  };

  return {schema, defaultValues};
}
