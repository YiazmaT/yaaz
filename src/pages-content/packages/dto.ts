import {PackageStockChangeReason} from "./types";

export interface CreatePackageDto {
  name: string;
  description?: string | null;
  image?: File | null;
}

export interface UpdatePackageDto extends CreatePackageDto {
  id: string;
}

export interface DeletePackageDto {
  id: string;
}

export interface StockItem {
  packageId: string;
  quantity: string;
  cost?: string;
}

export interface AddStockDto {
  items: StockItem[];
}

export interface StockChangeDto {
  packageId: string;
  newStock: string;
  reason: PackageStockChangeReason;
  comment?: string;
}
