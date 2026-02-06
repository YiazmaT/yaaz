export interface SaleItemDto {
  product_id: string;
  quantity: number;
  unit_price: string;
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
  is_quote?: boolean;
}

export interface UpdateSaleDto extends CreateSaleDto {
  id: string;
  updatePrices?: boolean;
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

export interface PriceChangeWarning {
  productId: string;
  productName: string;
  originalPrice: string;
  currentPrice: string;
}

export interface ConvertQuoteDto {
  id: string;
  force?: boolean;
}

export interface ConvertQuoteResponse {
  success: boolean;
  sale?: any;
  stockWarnings?: ProductStockWarning[];
  packageWarnings?: PackageStockWarning[];
}

export interface CreateSaleResponse {
  success: boolean;
  sale?: any;
  stockWarnings?: ProductStockWarning[];
  packageWarnings?: PackageStockWarning[];
  priceChangeWarnings?: PriceChangeWarning[];
}
