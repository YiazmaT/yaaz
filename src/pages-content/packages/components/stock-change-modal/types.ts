import {Package} from "../../types";

export interface StockChangeModalProps {
  item: Package | null;
  onClose: () => void;
  onSuccess: () => void;
}
