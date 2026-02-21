import {FinanceCategory} from "../types";

export interface CategoriesTableConfigProps {
  onEdit: (row: FinanceCategory) => void;
  onToggleActive: (row: FinanceCategory) => void;
}
