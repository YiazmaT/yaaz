export interface SaleItemDto {
  product_id: string;
  quantity: number;
}

export interface SalePackageDto {
  package_id: string;
  quantity: number;
}

export interface CreateSaleDto {
  payment_method: string;
  total: string;
  items: SaleItemDto[];
  packages: SalePackageDto[];
  force?: boolean;
}

export interface UpdateSaleDto extends CreateSaleDto {
  id: string;
}

export interface DeleteSaleDto {
  id: string;
}

export interface ProductStockWarning {
  productId: string;
  productName: string;
  currentStock: number;
  requestedQuantity: number;
  resultingStock: number;
}

export interface PackageStockWarning {
  packageId: string;
  packageName: string;
  currentStock: number;
  requestedQuantity: number;
  resultingStock: number;
}

export interface CreateSaleResponse {
  success: boolean;
  sale?: any;
  stockWarnings?: ProductStockWarning[];
  packageWarnings?: PackageStockWarning[];
}
