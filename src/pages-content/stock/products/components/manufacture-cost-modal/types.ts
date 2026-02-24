import {Product} from "../../types";

export interface ManufactureCostModalProps {
  open: boolean;
  onClose: () => void;
  product: Product | null;
}

export interface ManufactureCostItem {
  id: string;
  name: string;
  unity: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
}
