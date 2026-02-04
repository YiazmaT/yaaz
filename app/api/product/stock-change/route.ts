import {authenticateRequest} from "@/src/lib/auth";
import {logCreate, logCritical, logError, LogModule, LogSource} from "@/src/lib/logger";
import {prisma} from "@/src/lib/prisma";
import {StockChangeDto} from "@/src/pages-content/products/dto";
import {ProductStockChangeReason} from "@/src/pages-content/products/types";
import {NextRequest, NextResponse} from "next/server";

const ROUTE = "/api/product/stock-change";

export async function POST(req: NextRequest) {
  const auth = await authenticateRequest(LogModule.PRODUCT, ROUTE);
  if (auth.error) return auth.error;

  try {
    const {productId, newStock, reason, comment}: StockChangeDto = await req.json();

    if (!productId || newStock === undefined || newStock === null || !reason) {
      logError({
        module: LogModule.PRODUCT,
        source: LogSource.API,
        message: "api.errors.missingRequiredFields",
        route: ROUTE,
        userId: auth.user!.id,
        tenantId: auth.tenant_id,
      });
      return NextResponse.json({error: "api.errors.missingRequiredFields"}, {status: 400});
    }

    if (reason === ProductStockChangeReason.other && !comment) {
      logError({
        module: LogModule.PRODUCT,
        source: LogSource.API,
        message: "products.stockChange.commentRequired",
        route: ROUTE,
        userId: auth.user!.id,
        tenantId: auth.tenant_id,
      });
      return NextResponse.json({error: "products.stockChange.commentRequired"}, {status: 400});
    }

    const product = await prisma.product.findUnique({
      where: {id: productId, tenant_id: auth.tenant_id},
      select: {stock: true},
    });

    if (!product) {
      logError({
        module: LogModule.PRODUCT,
        source: LogSource.API,
        message: "api.errors.dataNotFound",
        route: ROUTE,
        userId: auth.user!.id,
        tenantId: auth.tenant_id,
      });
      return NextResponse.json({error: "api.errors.dataNotFound"}, {status: 404});
    }

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
          creator_id: auth.user!.id,
        },
      }),
    ]);

    logCreate({
      module: LogModule.PRODUCT,
      source: LogSource.API,
      content: {productId, previousStock, newStock, reason, comment},
      route: ROUTE,
      userId: auth.user!.id,
      tenantId: auth.tenant_id,
    });

    return NextResponse.json({success: true}, {status: 200});
  } catch (error) {
    await logCritical({module: LogModule.PRODUCT, source: LogSource.API, error, route: ROUTE, userId: auth.user!.id, tenantId: auth.tenant_id});
    return NextResponse.json({error: "api.errors.somethingWentWrong"}, {status: 500});
  }
}
