import {useTranslate} from "@/src/contexts/translation-context";
import {IngredientStockChangeReason} from "./types";

export function useIngredientsConstants() {
  const {translate} = useTranslate();

  const unitOfMeasures = {
    g: {value: "g", label: "g"},
    ml: {value: "ml", label: "ml"},
    unity: {value: "unity", label: translate('ingredients.unity')},
  };

  const stockChangeReasons = {
    stolen: {value: IngredientStockChangeReason.stolen, label: translate("ingredients.stockChange.reasons.stolen")},
    expired: {value: IngredientStockChangeReason.expired, label: translate("ingredients.stockChange.reasons.expired")},
    damaged: {value: IngredientStockChangeReason.damaged, label: translate("ingredients.stockChange.reasons.damaged")},
    spillage: {value: IngredientStockChangeReason.spillage, label: translate("ingredients.stockChange.reasons.spillage")},
    found: {value: IngredientStockChangeReason.found, label: translate("ingredients.stockChange.reasons.found")},
    inventory_correction: {value: IngredientStockChangeReason.inventory_correction, label: translate("ingredients.stockChange.reasons.inventoryCorrection")},
    other: {value: IngredientStockChangeReason.other, label: translate("ingredients.stockChange.reasons.other")},
  };

  return {unitOfMeasures, stockChangeReasons};
}
