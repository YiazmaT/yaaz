import Decimal from "decimal.js";
import {authenticateRequest} from "@/src/lib/auth";
import {logCritical, LogModule, LogSource, logGet} from "@/src/lib/logger";
import {prisma} from "@/src/lib/prisma";
import {NextRequest, NextResponse} from "next/server";

const ROUTE = "/api/ingredient/paginated-list";

export async function GET(req: NextRequest) {
  const auth = await authenticateRequest(LogModule.INGREDIENT, ROUTE);
  if (auth.error) return auth.error;

  try {
    const {searchParams} = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const skip = (page - 1) * limit;

    const where = search
      ? {
          tenant_id: auth.tenant_id,
          OR: [{name: {contains: search, mode: "insensitive" as const}}, {description: {contains: search, mode: "insensitive" as const}}],
        }
      : {tenant_id: auth.tenant_id};

    const [ingredients, total] = await Promise.all([
      prisma.ingredient.findMany({
        where,
        skip,
        take: limit,
        orderBy: {name: "asc"},
        omit: {creation_date: true, creator_id: true, last_edit_date: true, last_editor_id: true},
        include: {
          costs: {
            where: {price: {gt: 0}},
            orderBy: {creation_date: "desc"},
            take: 1,
          },
        },
      }),
      prisma.ingredient.count({where}),
    ]);

    const data = ingredients.map((ingredient) => {
      const lastCostEntry = ingredient.costs[0];
      let lastCost = null;
      if (lastCostEntry) {
        const quantity = new Decimal(lastCostEntry.quantity);
        if (quantity.greaterThan(0)) {
          lastCost = new Decimal(lastCostEntry.price).div(quantity).toNumber();
        }
      }
      return {
        ...ingredient,
        lastCost,
      };
    });

    const response = {data, total, page, limit};
    logGet({module: LogModule.INGREDIENT, source: LogSource.API, content: response, userId: auth.user!.id, tenantId: auth.tenant_id, route: ROUTE});

    return NextResponse.json(response, {status: 200});
  } catch (error) {
    await logCritical({module: LogModule.INGREDIENT, source: LogSource.API, error, route: ROUTE, userId: auth.user!.id, tenantId: auth.tenant_id});
    return NextResponse.json({error: "api.errors.somethingWentWrong"}, {status: 500});
  }
}
