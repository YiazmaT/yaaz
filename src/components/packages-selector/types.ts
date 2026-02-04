import {PackageType} from "@/src/pages-content/packages/types";

export interface CompositionPackage {
  id: string;
  name: string;
  description: string | null;
  image: string | null;
  lastCost?: string | null;
}

export interface PackageCompositionItem {
  package: CompositionPackage;
  quantity: string;
  cost?: string;
}

export interface PackagesSelectorProps {
  value: PackageCompositionItem[];
  onChange: (value: PackageCompositionItem[]) => void;
  disabled?: boolean;
  showCostField?: boolean;
  typeFilter?: PackageType;
}

export interface PackageRowProps {
  item: PackageCompositionItem;
  handleQuantityChange: (packageId: string, quantity: string) => void;
  handleCostChange?: (packageId: string, cost: string) => void;
  disabled?: boolean;
  handleRemove: (packageId: string) => void;
  showCostField?: boolean;
}
