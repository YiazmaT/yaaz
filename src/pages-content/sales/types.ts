import {ProductItem} from "@/src/components/products-selector/types";
import {PackageCompositionItem} from "@/src/components/packages-selector/types";

export type ItemSale = ProductItem;

export enum PaymentMethod {
  credit = "credit",
  debit = "debit",
  pix = "pix",
  cash = "cash",
  iFood = "iFood",
}

export interface Sale {
  id: string;
  payment_method: PaymentMethod;
  total: string;
  approximate_cost?: string;
  items: ItemSale[];
  packages?: PackageCompositionItem[];
  creation_date?: string;
}
