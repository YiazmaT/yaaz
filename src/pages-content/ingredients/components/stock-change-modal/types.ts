import {Ingredient} from "../../types";

export interface StockChangeModalProps {
  item: Ingredient | null;
  onClose: () => void;
  onSuccess: () => void;
}
