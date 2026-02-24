import {Ingredient} from "../../stock/ingredients/types";
import {Package} from "../../stock/packages/types";
import {Product} from "../../stock/products/types";

export interface Nfe {
  id: string;
  code: number;
  description: string;
  supplier?: string;
  nfe_number: string;
  date: string;
  total_amount: number;
  file_url?: string;
  stock_added: boolean;
  active: boolean;
  items: NfeItem[];
  _count?: {items: number};
}

export interface NfeItem {
  id: string;
  nfe_id: string;
  item_type: "ingredient" | "product" | "package";
  ingredient_id?: string;
  product_id?: string;
  package_id?: string;
  ingredient?: Ingredient;
  product?: Product;
  package?: Package;
  quantity: number;
  unit_price: number;
  total_price: number;
}
