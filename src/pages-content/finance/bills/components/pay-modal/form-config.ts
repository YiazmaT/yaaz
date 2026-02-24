import {useTranslate} from "@/src/contexts/translation-context";
import * as yup from "yup";
import {PayFormValues} from "./types";
import moment from "moment";

export function usePayFormConfig() {
  const {translate} = useTranslate();

  const schema = yup.object().shape({
    paidDate: yup.string().required().label(translate("finance.bills.fields.paidDate")),
  });

  const defaultValues: PayFormValues = {
    bankAccount: null,
    paidDate: moment().format("YYYY-MM-DDTHH:mm"),
  };

  return {schema, defaultValues};
}
