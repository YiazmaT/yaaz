import * as yup from "yup";
import moment from "moment";
import {useTranslate} from "@/src/contexts/translation-context";
import {MovementFilters} from "./types";

export function useMovementFormConfig() {
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
  });

  const defaultValues: MovementFilters = {
    dateFrom: moment().subtract(1, "week").format("YYYY-MM-DD"),
    dateTo: today,
  };

  return {schema, defaultValues};
}
