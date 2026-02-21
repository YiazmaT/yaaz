import {useTranslate} from "@/src/contexts/translation-context";
import {PackageType, PackageStockChangeReason} from "./types";

export function usePackagesConstants() {
  const {translate} = useTranslate();

  const typeOfPackage = {
    productPackage: {value: PackageType.product, label: translate("packages.type.product")},
    salePackage: {value: PackageType.sale, label: translate("packages.type.sale")},
  };

  const stockChangeReasons = {
    stolen: {value: PackageStockChangeReason.stolen, label: translate("packages.stockChange.reasons.stolen")},
    damaged: {value: PackageStockChangeReason.damaged, label: translate("packages.stockChange.reasons.damaged")},
    found: {value: PackageStockChangeReason.found, label: translate("packages.stockChange.reasons.found")},
    inventory_correction: {value: PackageStockChangeReason.inventory_correction, label: translate("packages.stockChange.reasons.inventoryCorrection")},
    other: {value: PackageStockChangeReason.other, label: translate("packages.stockChange.reasons.other")},
  };

  return {typeOfPackage, stockChangeReasons};
}
