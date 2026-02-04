import {authenticateRequest} from "@/src/lib/auth";
import {logCreate, logCritical, logError, LogModule, LogSource} from "@/src/lib/logger";
import {prisma} from "@/src/lib/prisma";
import {StockChangeDto} from "@/src/pages-content/packages/dto";
import {PackageStockChangeReason} from "@/src/pages-content/packages/types";
import {NextRequest, NextResponse} from "next/server";

const ROUTE = "/api/package/stock-change";

export async function POST(req: NextRequest) {
  const auth = await authenticateRequest(LogModule.PACKAGE, ROUTE);
  if (auth.error) return auth.error;

  try {
    const {packageId, newStock, reason, comment}: StockChangeDto = await req.json();

    if (!packageId || newStock === undefined || newStock === null || !reason) {
      logError({
        module: LogModule.PACKAGE,
        source: LogSource.API,
        message: "api.errors.missingRequiredFields",
        route: ROUTE,
        userId: auth.user!.id,
        tenantId: auth.tenant_id,
      });
      return NextResponse.json({error: "api.errors.missingRequiredFields"}, {status: 400});
    }

    if (reason === PackageStockChangeReason.other && !comment) {
      logError({
        module: LogModule.PACKAGE,
        source: LogSource.API,
        message: "packages.stockChange.commentRequired",
        route: ROUTE,
        userId: auth.user!.id,
        tenantId: auth.tenant_id,
      });
      return NextResponse.json({error: "packages.stockChange.commentRequired"}, {status: 400});
    }

    const pkg = await prisma.package.findUnique({
      where: {id: packageId, tenant_id: auth.tenant_id},
      select: {stock: true},
    });

    if (!pkg) {
      logError({
        module: LogModule.PACKAGE,
        source: LogSource.API,
        message: "api.errors.dataNotFound",
        route: ROUTE,
        userId: auth.user!.id,
        tenantId: auth.tenant_id,
      });
      return NextResponse.json({error: "api.errors.dataNotFound"}, {status: 404});
    }

    const previousStock = pkg.stock;

    await prisma.$transaction([
      prisma.package.update({
        where: {id: packageId},
        data: {stock: newStock},
      }),
      prisma.packageStockChange.create({
        data: {
          tenant_id: auth.tenant_id,
          package_id: packageId,
          previous_stock: previousStock,
          new_stock: newStock,
          reason: reason as any,
          comment: comment || null,
          creator_id: auth.user!.id,
        },
      }),
    ]);

    logCreate({
      module: LogModule.PACKAGE,
      source: LogSource.API,
      content: {packageId, previousStock: previousStock.toString(), newStock, reason, comment},
      route: ROUTE,
      userId: auth.user!.id,
      tenantId: auth.tenant_id,
    });

    return NextResponse.json({success: true}, {status: 200});
  } catch (error) {
    await logCritical({module: LogModule.PACKAGE, source: LogSource.API, error, route: ROUTE, userId: auth.user!.id, tenantId: auth.tenant_id});
    return NextResponse.json({error: "api.errors.somethingWentWrong"}, {status: 500});
  }
}
