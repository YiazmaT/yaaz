import {Product} from "../../types";

export interface StockChangeModalProps {
  item: Product | null;
  onClose: () => void;
  onSuccess: () => void;
}
