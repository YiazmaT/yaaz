import {IngredientStockWarning, PackageStockWarning} from "../../dto";

export interface AddStockDrawerProps {
  onSuccess?: () => void;
}

export interface AddStockDrawerRef {
  open: () => void;
}

export interface AddStockResponse {
  success: boolean;
  ingredientWarnings?: IngredientStockWarning[];
  packageWarnings?: PackageStockWarning[];
}
