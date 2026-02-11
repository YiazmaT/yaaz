import {LogModule} from "@/src/lib/logger";
import {prisma} from "@/src/lib/prisma";
import {withAuth} from "@/src/lib/route-handler";
import {StockChangeDto} from "@/src/pages-content/packages/dto";
import {PackageStockChangeReason} from "@/src/pages-content/packages/types";
import {NextRequest, NextResponse} from "next/server";

const ROUTE = "/api/package/stock-change";

export async function POST(req: NextRequest) {
  return withAuth(LogModule.PACKAGE, ROUTE, async (auth, log, error) => {
    const {packageId, newStock, reason, comment}: StockChangeDto = await req.json();

    if (!packageId || newStock === undefined || newStock === null || !reason) {
      return error("api.errors.missingRequiredFields", 400);
    }

    if (reason === PackageStockChangeReason.other && !comment) {
      return error("packages.stockChange.commentRequired", 400);
    }

    const pkg = await prisma.package.findUnique({
      where: {id: packageId, tenant_id: auth.tenant_id},
      select: {stock: true},
    });

    if (!pkg) return error("api.errors.notFound", 404);

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
          creator_id: auth.user.id,
        },
      }),
    ]);

    log("create", {content: {packageId, previousStock: previousStock.toString(), newStock, reason, comment}});

    return NextResponse.json({success: true}, {status: 200});
  });
}
