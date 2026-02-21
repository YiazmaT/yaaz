import {useTranslate} from "@/src/contexts/translation-context";
import {ProductStockChangeReason} from "./types";

export function useProductsConstants() {
  const {translate} = useTranslate();

  const stockChangeReasons = {
    stolen: {value: ProductStockChangeReason.stolen, label: translate("products.stockChange.reasons.stolen")},
    expired: {value: ProductStockChangeReason.expired, label: translate("products.stockChange.reasons.expired")},
    damaged: {value: ProductStockChangeReason.damaged, label: translate("products.stockChange.reasons.damaged")},
    found: {value: ProductStockChangeReason.found, label: translate("products.stockChange.reasons.found")},
    inventory_correction: {value: ProductStockChangeReason.inventory_correction, label: translate("products.stockChange.reasons.inventoryCorrection")},
    donation: {value: ProductStockChangeReason.donation, label: translate("products.stockChange.reasons.donation")},
    other: {value: ProductStockChangeReason.other, label: translate("products.stockChange.reasons.other")},
  };

  return {stockChangeReasons};
}
