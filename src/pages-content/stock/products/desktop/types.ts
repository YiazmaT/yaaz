import {TableConfigProps} from "@/src/@types/global-types";
import {Product} from "../types";
import {useProducts} from "../use-products";

export interface DesktopViewProps {
  products: ReturnType<typeof useProducts>;
}

export interface ProductTableConfigProps extends TableConfigProps<Product> {
  onToggleLandingPage: (row: Product) => void;
  onStockChange: (row: Product) => void;
  onStockHistoryClick: (row: Product) => void;
  onToggleActive: (row: Product) => void;
  onOpenFiles: (row: Product) => void;
}
