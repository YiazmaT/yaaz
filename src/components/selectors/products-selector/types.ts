import {Product} from "@/src/pages-content/stock/products/types";

export interface ProductItem {
  product: Product;
  quantity: number;
  unit_price?: string;
}

export interface ProductsSelectorProps {
  value: ProductItem[];
  onChange: (items: ProductItem[]) => void;
  disabled?: boolean;
  incrementOnDuplicate?: boolean;
  priceChangeText?: string;
  onSelect?: (product: Product) => void;
}

export interface ProductRowProps {
  item: ProductItem;
  handleQuantityChange: (productId: string, quantity: number) => void;
  handleRemove: (productId: string) => void;
  disabled?: boolean;
  formatCurrency: (value: number | string | null | undefined, maxDecimals?: number) => string;
  priceChangeText?: string;
}
