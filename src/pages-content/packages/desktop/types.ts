import {TableConfigProps} from "@/src/@types/global-types";
import {Package} from "../types";
import {usePackages} from "../use-packages";

export interface DesktopViewProps {
  packages: ReturnType<typeof usePackages>;
}

export interface PackagesTableConfigProps extends TableConfigProps<Package> {
  onCostClick?: (row: Package) => void;
  onStockChange: (row: Package) => void;
  onStockHistoryClick: (row: Package) => void;
  onToggleActive: (row: Package) => void;
}
