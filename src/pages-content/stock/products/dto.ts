import {ProductStockChangeReason} from "./types";

export interface CompositionItemDto {
  ingredient: {id: string};
  quantity: number;
}

export interface PackageCompositionItemDto {
  package: {id: string};
  quantity: number;
}

export interface CreateProductDto {
  name: string;
  price: number;
  description?: string | null;
  image?: File | null;
  composition?: CompositionItemDto[];
  packages?: PackageCompositionItemDto[];
}

export interface UpdateProductDto extends CreateProductDto {
  id: string;
}

export interface DeleteProductDto {
  id: string;
}

export interface ProductStockItem {
  productId: string;
  quantity: number;
}

export interface AddProductStockDto {
  items: ProductStockItem[];
  deductIngredients: boolean;
  deductPackages: boolean;
  force?: boolean;
}

export interface IngredientStockWarning {
  ingredientId: string;
  ingredientName: string;
  currentStock: number;
  requiredAmount: number;
  resultingStock: number;
}

export interface PackageStockWarning {
  packageId: string;
  packageName: string;
  currentStock: number;
  requiredAmount: number;
  resultingStock: number;
}

export interface StockChangeDto {
  productId: string;
  newStock: number;
  reason: ProductStockChangeReason;
  comment?: string;
}

export interface UploadProductFileDto {
  productId: string;
}

export interface DeleteProductFileDto {
  productId: string;
  fileUrl: string;
}
