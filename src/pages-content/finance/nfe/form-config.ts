import {useTranslate} from "@/src/contexts/translation-context";
import * as yup from "yup";
import moment from "moment";

export interface NfeFormItem {
  id: string;
  itemType: "ingredient" | "product" | "package";
  itemId: string;
  name: string;
  image?: string | null;
  unityOfMeasure: string;
  quantity: string;
  unitPrice: string;
}

export interface NfeFormValues {
  description: string;
  supplier: string;
  nfeNumber: string;
  date: string;
  items: NfeFormItem[];
  file: File | null;
}

export function useNfeFormConfig() {
  const {translate} = useTranslate();

  const schema = yup.object().shape({
    description: yup.string().required().label(translate("finance.nfe.fields.description")),
    nfeNumber: yup.string().required().label(translate("finance.nfe.fields.nfeNumber")),
    date: yup.string().required().label(translate("finance.nfe.fields.date")),
    items: yup
      .array()
      .min(1, translate("finance.nfe.errors.minOneItem"))
      .of(
        yup.object().shape({
          quantity: yup
            .string()
            .required()
            .test("positive", translate("finance.nfe.errors.quantityPositive"), (v) => Number(v) > 0),
          unitPrice: yup
            .string()
            .required()
            .test("positive", translate("finance.nfe.errors.pricePositive"), (v) => Number(v) > 0),
        }),
      ),
  });

  const defaultValues: NfeFormValues = {
    description: "",
    supplier: "",
    nfeNumber: "",
    date: moment().format("YYYY-MM-DD"),
    items: [],
    file: null,
  };

  return {schema, defaultValues};
}
