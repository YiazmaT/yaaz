import {Package, PackageType} from "@/src/pages-content/stock/packages/types";

export interface PackageCompositionItem {
  package: Package;
  quantity: string;
  cost?: string;
}

export interface PackagesSelectorProps {
  value: PackageCompositionItem[];
  onChange: (value: PackageCompositionItem[]) => void;
  disabled?: boolean;
  showCostField?: boolean;
  typeFilter?: PackageType;
  onSelect?: (pkg: Package) => void;
}

export interface PackageRowProps {
  item: PackageCompositionItem;
  handleQuantityChange: (packageId: string, quantity: string) => void;
  handleCostChange?: (packageId: string, cost: string) => void;
  disabled?: boolean;
  handleRemove: (packageId: string) => void;
  showCostField?: boolean;
}
