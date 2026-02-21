import {UnityOfMeasure} from "../unity-of-measure/types";

export enum PackageType {
  sale = "sale",
  product = "product",
}

export enum PackageStockChangeReason {
  stolen = "stolen",
  damaged = "damaged",
  found = "found",
  inventory_correction = "inventory_correction",
  other = "other",
}

export interface Package {
  id: string;
  code: number;
  name: string;
  description?: string | null;
  image: string | null;
  type: PackageType;
  stock: string;
  min_stock?: string;
  unit_of_measure_id?: string | null;
  unity_of_measure?: UnityOfMeasure | null;
  active: boolean;
  costs?: PackageCost[];
  lastCost?: number | null;
}

export interface PackagesFilters {
  showInactives?: boolean;
}

export interface PackageCost {
  id: string;
  package_id: string;
  quantity: string;
  price: string;
  creator_id: string | null;
  creation_date: Date;
}
