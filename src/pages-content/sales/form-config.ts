import {useTranslate} from "@/src/contexts/translation-context";
import {PackageCompositionItem} from "@/src/components/packages-selector/types";
import {Client} from "@/src/pages-content/client/types";
import {PaymentMethod, ItemSale} from "./types";
import * as yup from "yup";

export interface SaleFormValues {
  payment_method: PaymentMethod;
  items: ItemSale[];
  packages: PackageCompositionItem[];
  total: string;
  is_quote: boolean;
  client: Client | null;
}

export function useSaleFormConfig() {
  const {translate} = useTranslate();

  const schema = yup.object().shape({
    payment_method: yup.string().required().label(translate("sales.fields.paymentMethod")),
    items: yup.array().label(translate("sales.fields.items")),
    packages: yup.array().label(translate("global.packages")),
  });

  const defaultValues: SaleFormValues = {
    payment_method: PaymentMethod.credit,
    items: [],
    packages: [],
    total: "0",
    is_quote: false,
    client: null,
  };

  return {
    schema,
    defaultValues,
  };
}
