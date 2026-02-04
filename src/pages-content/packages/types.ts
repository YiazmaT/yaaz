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
  name: string;
  description?: string | null;
  image: string | null;
  type: PackageType;
  stock: string;
  min_stock?: string;
  costs?: PackageCost[];
  lastCost?: number | null;
}

export interface PackageCost {
  id: string;
  package_id: string;
  quantity: string;
  price: string;
  creator_id: string | null;
  creation_date: Date;
}
