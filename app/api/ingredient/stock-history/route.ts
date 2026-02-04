import {authenticateRequest} from "@/src/lib/auth";
import {logCritical, logError, logGet, LogModule, LogSource} from "@/src/lib/logger";
import {prisma} from "@/src/lib/prisma";
import {NextRequest, NextResponse} from "next/server";

const ROUTE = "/api/ingredient/stock-history";

export async function GET(req: NextRequest) {
  const auth = await authenticateRequest(LogModule.INGREDIENT, ROUTE);
  if (auth.error) return auth.error;

  try {
    const {searchParams} = new URL(req.url);
    const ingredientId = searchParams.get("ingredientId");

    if (!ingredientId) {
      logError({
        module: LogModule.INGREDIENT,
        source: LogSource.API,
        message: "api.errors.missingRequiredFields",
        route: ROUTE,
        userId: auth.user!.id,
        tenantId: auth.tenant_id,
      });
      return NextResponse.json({error: "api.errors.missingRequiredFields"}, {status: 400});
    }

    const [stockChanges, stockCosts] = await Promise.all([
      prisma.ingredientStockChange.findMany({
        where: {ingredient_id: ingredientId, tenant_id: auth.tenant_id},
        orderBy: {creation_date: "desc"},
        take: 50,
        include: {
          creator: {
            select: {name: true},
          },
        },
      }),
      prisma.ingredientCost.findMany({
        where: {ingredient_id: ingredientId, tenant_id: auth.tenant_id},
        orderBy: {creation_date: "desc"},
        take: 50,
        include: {
          creator: {
            select: {name: true},
          },
        },
      }),
    ]);

    const history = [
      ...stockChanges.map((change) => ({
        id: change.id,
        type: "stock_change" as const,
        amount: Number(change.new_stock) - Number(change.previous_stock),
        reason: change.reason,
        comment: change.comment,
        date: change.creation_date,
        userName: change.creator?.name ?? null,
      })),
      ...stockCosts.map((cost) => ({
        id: cost.id,
        type: "stock_cost" as const,
        amount: Number(cost.quantity),
        reason: null,
        comment: null,
        date: cost.creation_date,
        userName: cost.creator?.name ?? null,
      })),
    ];

    history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    logGet({module: LogModule.INGREDIENT, source: LogSource.API, route: ROUTE, userId: auth.user!.id, tenantId: auth.tenant_id, content: {ingredientId, history}});

    return NextResponse.json({history}, {status: 200});
  } catch (error) {
    await logCritical({module: LogModule.INGREDIENT, source: LogSource.API, error, route: ROUTE, userId: auth.user!.id, tenantId: auth.tenant_id});
    return NextResponse.json({error: "api.errors.somethingWentWrong"}, {status: 500});
  }
}
