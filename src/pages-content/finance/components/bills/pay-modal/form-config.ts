import {useTranslate} from "@/src/contexts/translation-context";
import * as yup from "yup";
import {PayFormValues} from "./types";
import moment from "moment";

export function usePayFormConfig() {
  const {translate} = useTranslate();

  const schema = yup.object().shape({
    bankAccount: yup
      .object()
      .required()
      .nullable()
      .test("required", translate("finance.bills.errors.selectAccount"), (v) => !!v),
    paidDate: yup.string().required().label(translate("finance.bills.fields.paidDate")),
  });

  const defaultValues: PayFormValues = {
    bankAccount: null,
    paidDate: moment().format("YYYY-MM-DD"),
  };

  return {schema, defaultValues};
}
