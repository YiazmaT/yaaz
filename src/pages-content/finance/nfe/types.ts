import {UnityOfMeasure} from "../../stock/unity-of-measure/types";

export interface Nfe {
  id: string;
  code: number;
  description: string;
  supplier?: string;
  nfe_number: string;
  date: string;
  total_amount: number;
  file_url?: string;
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
  ingredient?: {id: string; name: string; image: string | null; unity_of_measure: UnityOfMeasure | null};
  product?: {id: string; name: string; image: string | null};
  package?: {id: string; name: string; image: string | null};
  quantity: number;
  unit_price: number;
  total_price: number;
}
