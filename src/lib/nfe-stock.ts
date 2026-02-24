import Decimal from "decimal.js";
import {prisma} from "@/src/lib/prisma";

interface NfeStockItem {
  item_type: string;
  ingredient_id?: string | null;
  product_id?: string | null;
  package_id?: string | null;
  quantity: Decimal | string | number;
  total_price: Decimal | string | number;
  product?: {stock: Decimal | string | number} | null;
}

export function buildNfeStockOps(items: NfeStockItem[], tenantId: string, userId: string, nfeCode?: number): any[] {
  const ops: any[] = [];
  const comment = nfeCode != null ? `#${nfeCode}` : null;

  for (const item of items) {
    const qty = new Decimal(String(item.quantity));
    const totalPrice = new Decimal(String(item.total_price));

    if (item.item_type === "ingredient" && item.ingredient_id) {
      ops.push(
        prisma.ingredient.update({
          where: {id: item.ingredient_id, tenant_id: tenantId},
          data: {stock: {increment: qty}},
        }),
        prisma.ingredientCost.create({
          data: {
            tenant_id: tenantId,
            ingredient_id: item.ingredient_id,
            quantity: qty,
            price: totalPrice,
            comment,
            creator_id: userId,
          },
        }),
      );
    } else if (item.item_type === "product" && item.product_id) {
      const previousStock = new Decimal(String(item.product?.stock ?? 0));
      ops.push(
        prisma.product.update({
          where: {id: item.product_id, tenant_id: tenantId},
          data: {stock: {increment: qty}},
        }),
        prisma.productStockChange.create({
          data: {
            tenant_id: tenantId,
            product_id: item.product_id,
            previous_stock: previousStock,
            new_stock: previousStock.plus(qty),
            reason: null,
            comment,
            creator_id: userId,
          },
        }),
      );
    } else if (item.item_type === "package" && item.package_id) {
      ops.push(
        prisma.package.update({
          where: {id: item.package_id, tenant_id: tenantId},
          data: {stock: {increment: qty}},
        }),
        prisma.packageCost.create({
          data: {
            tenant_id: tenantId,
            package_id: item.package_id,
            quantity: qty,
            price: totalPrice,
            comment,
            creator_id: userId,
          },
        }),
      );
    }
  }

  return ops;
}
