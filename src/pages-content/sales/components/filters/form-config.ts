import {useTranslate} from "@/src/contexts/translation-context";
import {SalesFilterFormValues} from "./types";
import * as yup from "yup";
import moment from "moment";

export function useSalesFilterFormConfig() {
  const {translate} = useTranslate();
  const today = moment().format("YYYY-MM-DD");

  const schema = yup.object().shape({
    dateFrom: yup
      .string()
      .test("not-future", translate("sales.filters.futureDateNotAllowed"), (value) => {
        if (!value) return true;
        return value <= today;
      })
      .test("from-before-to", translate("sales.filters.dateFromGreaterThanTo"), function (value) {
        const {dateTo} = this.parent;
        if (!value || !dateTo) return true;
        return value <= dateTo;
      }),
    dateTo: yup.string().test("not-future", translate("sales.filters.futureDateNotAllowed"), (value) => {
      if (!value) return true;
      return value <= today;
    }),
    valueFrom: yup.string().test("from-before-to", translate("sales.filters.valueFromGreaterThanTo"), function (value) {
      const {valueTo} = this.parent;
      const fromValue = parseFloat(value || "0");
      const toValue = parseFloat(valueTo || "0");
      if (fromValue === 0 || toValue === 0) return true;
      return fromValue <= toValue;
    }),
    valueTo: yup.string(),
  });

  const defaultValues: SalesFilterFormValues = {
    dateFrom: "",
    dateTo: "",
    valueFrom: "0",
    valueTo: "0",
  };

  return {
    schema,
    defaultValues,
  };
}
