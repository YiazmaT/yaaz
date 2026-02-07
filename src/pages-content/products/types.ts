import {CompositionItem} from "@/src/components/ingredients-selector/types";
import {PackageCompositionItem} from "@/src/components/packages-selector/types";

export type {CompositionItem, PackageCompositionItem};

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
  name: string;
  price: string;
  description?: string | null;
  image?: string | null;
  stock: number;
  min_stock?: number;
  composition?: CompositionItem[];
  packages?: PackageCompositionItem[];
  approximateCost?: number;
  files?: string[];
  displayLandingPage: boolean;
  active: boolean;
}

export interface ProductsFilters {
  showInactives?: boolean;
}
