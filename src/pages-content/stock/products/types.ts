import {CompositionItem} from "@/src/components/selectors/ingredients-selector/types";
import {PackageCompositionItem} from "@/src/components/selectors/packages-selector/types";
import {UnityOfMeasure} from "../unity-of-measure/types";

export type {CompositionItem, PackageCompositionItem, UnityOfMeasure};

export enum ProductStockChangeReason {
  stolen = "stolen",
  expired = "expired",
  damaged = "damaged",
  found = "found",
  inventory_correction = "inventory_correction",
  donation = "donation",
  other = "other",
}

export interface Product {
  id: string;
  code: number;
  name: string;
  price: string;
  description?: string | null;
  image?: string | null;
  stock: string;
  min_stock?: string;
  composition?: CompositionItem[];
  packages?: PackageCompositionItem[];
  approximateCost?: number;
  lastCost?: number | null;
  unit_of_measure_id?: string | null;
  unity_of_measure?: UnityOfMeasure | null;
  files?: string[];
  displayLandingPage: boolean;
  active: boolean;
}

export interface ProductsFilters {
  showInactives?: boolean;
}
