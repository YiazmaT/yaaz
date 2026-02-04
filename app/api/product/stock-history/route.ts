import {authenticateRequest} from "@/src/lib/auth";
import {logCritical, logError, logGet, LogModule, LogSource} from "@/src/lib/logger";
import {prisma} from "@/src/lib/prisma";
import {NextRequest, NextResponse} from "next/server";

const ROUTE = "/api/product/stock-history";

export async function GET(req: NextRequest) {
  const auth = await authenticateRequest(LogModule.PRODUCT, ROUTE);
  if (auth.error) return auth.error;

  try {
    const {searchParams} = new URL(req.url);
    const productId = searchParams.get("productId");

    if (!productId) {
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

    const stockChanges = await prisma.productStockChange.findMany({
      where: {product_id: productId, tenant_id: auth.tenant_id},
      orderBy: {creation_date: "desc"},
      take: 50,
      include: {
        creator: {
          select: {name: true},
        },
      },
    });

    const history = stockChanges.map((change) => ({
      id: change.id,
      type: "stock_change" as const,
      amount: change.new_stock - change.previous_stock,
      reason: change.reason,
      comment: change.comment,
      date: change.creation_date,
      userName: change.creator?.name ?? null,
    }));

    history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    logGet({module: LogModule.PRODUCT, source: LogSource.API, route: ROUTE, userId: auth.user!.id, tenantId: auth.tenant_id, content: {productId, history}});

    return NextResponse.json({history}, {status: 200});
  } catch (error) {
    await logCritical({module: LogModule.PRODUCT, source: LogSource.API, error, route: ROUTE, userId: auth.user!.id, tenantId: auth.tenant_id});
    return NextResponse.json({error: "api.errors.somethingWentWrong"}, {status: 500});
  }
}
