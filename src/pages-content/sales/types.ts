import {ProductItem} from "@/src/components/selectors/products-selector/types";
import {PackageCompositionItem} from "@/src/components/selectors/packages-selector/types";
import {Client} from "@/src/pages-content/client/types";
import {PaymentMethod} from "../finance/payment-method/types";

export type ItemSale = ProductItem;

export interface Sale {
  id: string;
  payment_method_id: string;
  payment_method: PaymentMethod;
  total: string;
  approximate_cost?: string;
  items: ItemSale[];
  packages?: PackageCompositionItem[];
  creation_date?: string;
  is_quote?: boolean;
  client_id?: string | null;
  client?: Client | null;
}
