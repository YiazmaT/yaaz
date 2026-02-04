import {Product} from "@/src/pages-content/products/types";

export interface ProductItem {
  product: Product;
  quantity: number;
}

export interface ProductsSelectorProps {
  value: ProductItem[];
  onChange: (items: ProductItem[]) => void;
  disabled?: boolean;
  incrementOnDuplicate?: boolean;
}

export interface ProductRowProps {
  item: ProductItem;
  handleQuantityChange: (productId: string, quantity: number) => void;
  handleRemove: (productId: string) => void;
  disabled?: boolean;
}
