import * as yup from "yup";
import moment from "moment";
import {useTranslate} from "@/src/contexts/translation-context";
import {ProfitMarginFilters} from "./types";

export function useProfitMarginFormConfig() {
  const {translate} = useTranslate();
  const today = moment().format("YYYY-MM-DD");

  const schema = yup.object().shape({
    dateFrom: yup
      .string()
      .required(translate("reports.errors.dateRequired"))
      .test("not-future", translate("reports.errors.futureDateNotAllowed"), (value) => {
        if (!value) return true;
        return value <= today;
      })
      .test("from-before-to", translate("reports.errors.dateFromGreaterThanTo"), function (value) {
        const {dateTo} = this.parent;
        if (!value || !dateTo) return true;
        return value <= dateTo;
      }),
    dateTo: yup
      .string()
      .required(translate("reports.errors.dateRequired"))
      .test("not-future", translate("reports.errors.futureDateNotAllowed"), (value) => {
        if (!value) return true;
        return value <= today;
      }),
    product: yup.object().nullable(),
  });

  const defaultValues: ProfitMarginFilters = {
    dateFrom: "",
    dateTo: "",
    product: null,
  };

  return {
    schema,
    defaultValues,
  };
}
