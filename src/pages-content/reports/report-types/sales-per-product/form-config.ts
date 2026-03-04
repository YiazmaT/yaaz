import * as yup from "yup";
import moment from "moment";
import {useTranslate} from "@/src/contexts/translation-context";
import {buildDateRangeSchema} from "../../utils";
import {SalesPerProductFilters} from "./types";

export function useSalesPerProductFormConfig() {
  const {translate} = useTranslate();
  const today = moment().format("YYYY-MM-DD");

  const schema = yup.object().shape(buildDateRangeSchema(today, translate));

  const defaultValues: SalesPerProductFilters = {
    dateFrom: moment().subtract(1, "week").format("YYYY-MM-DD"),
    dateTo: today,
  };

  return {schema, defaultValues};
}
