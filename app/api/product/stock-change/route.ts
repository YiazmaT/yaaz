import {LogModule} from "@/src/lib/logger";
import {prisma} from "@/src/lib/prisma";
import {withAuth} from "@/src/lib/route-handler";
import {StockChangeDto} from "@/src/pages-content/stock/products/dto";
import {ProductStockChangeReason} from "@/src/pages-content/stock/products/types";
import {NextRequest} from "next/server";

const ROUTE = "/api/product/stock-change";

export async function POST(req: NextRequest) {
  return withAuth(LogModule.PRODUCT, ROUTE, async ({auth, success, error}) => {
    const {productId, newStock, reason, comment}: StockChangeDto = await req.json();

    if (!productId || newStock === undefined || newStock === null || !reason) {
      return error("api.errors.missingRequiredFields", 400);
    }

    if (reason === ProductStockChangeReason.other && !comment) {
      return error("products.stockChange.commentRequired", 400);
    }

    const product = await prisma.product.findUnique({
      where: {id: productId, tenant_id: auth.tenant_id},
      select: {stock: true},
    });

    if (!product) return error("api.errors.dataNotFound", 404);

    const previousStock = product.stock;

    await prisma.$transaction([
      prisma.product.update({
        where: {id: productId},
        data: {stock: newStock},
      }),
      prisma.productStockChange.create({
        data: {
          tenant_id: auth.tenant_id,
          product_id: productId,
          previous_stock: previousStock,
          new_stock: newStock,
          reason: reason as any,
          comment: comment || null,
          creator_id: auth.user.id,
        },
      }),
    ]);

    return success("create", {productId, previousStock, newStock, reason, comment});
  });
}
