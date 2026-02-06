import Decimal from "decimal.js";
import {ProductStockWarning, PackageStockWarning} from "@/src/pages-content/sales/dto";

interface StockItem {
  id: string;
  name: string;
  stock: number;
  quantity: number;
}

export function checkStockWarnings(items: StockItem[], packages: StockItem[]) {
  const stockWarnings: ProductStockWarning[] = [];
  const packageWarnings: PackageStockWarning[] = [];

  for (const item of items) {
    const currentStock = new Decimal(item.stock);
    const resultingStock = currentStock.minus(item.quantity);
    if (resultingStock.lessThan(0)) {
      stockWarnings.push({
        productId: item.id,
        productName: item.name,
        currentStock: currentStock.toNumber(),
        requestedQuantity: item.quantity,
        resultingStock: resultingStock.toNumber(),
      });
    }
  }

  for (const pkg of packages) {
    const currentStock = new Decimal(pkg.stock);
    const resultingStock = currentStock.minus(pkg.quantity);
    if (resultingStock.lessThan(0)) {
      packageWarnings.push({
        packageId: pkg.id,
        packageName: pkg.name,
        currentStock: currentStock.toNumber(),
        requestedQuantity: pkg.quantity,
        resultingStock: resultingStock.toNumber(),
      });
    }
  }

  return {stockWarnings, packageWarnings, hasWarnings: stockWarnings.length > 0 || packageWarnings.length > 0};
}

interface DecrementItem {
  id: string;
  quantity: number;
}

export async function decrementStock(tx: any, items: DecrementItem[], packages: DecrementItem[]) {
  for (const item of items) {
    await tx.product.update({
      where: {id: item.id},
      data: {stock: {decrement: item.quantity}},
    });
  }

  for (const pkg of packages) {
    await tx.package.update({
      where: {id: pkg.id},
      data: {stock: {decrement: pkg.quantity}},
    });
  }
}
