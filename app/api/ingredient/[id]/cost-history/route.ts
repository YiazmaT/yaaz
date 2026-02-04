import Decimal from "decimal.js";
import {authenticateRequest} from "@/src/lib/auth";
import {logCritical, LogModule, LogSource, logGet} from "@/src/lib/logger";
import {prisma} from "@/src/lib/prisma";
import {NextRequest, NextResponse} from "next/server";

const ROUTE = "/api/ingredient/[id]/cost-history";

export async function GET(_: NextRequest, {params}: {params: Promise<{id: string}>}) {
  const auth = await authenticateRequest(LogModule.INGREDIENT, ROUTE);
  if (auth.error) return auth.error;

  try {
    const {id} = await params;

    const costs = await prisma.ingredientCost.findMany({
      where: {
        ingredient_id: id,
        tenant_id: auth.tenant_id,
        price: {gt: 0},
      },
      orderBy: {creation_date: "desc"},
      take: 100,
    });

    const data = costs.map((cost) => {
      const quantity = new Decimal(cost.quantity);
      const costPerUnit = quantity.greaterThan(0) ? new Decimal(cost.price).div(quantity).toNumber() : 0;
      return {
        id: cost.id,
        date: cost.creation_date,
        costPerUnit,
      };
    });

    logGet({module: LogModule.INGREDIENT, source: LogSource.API, content: {id, data}, userId: auth.user!.id, tenantId: auth.tenant_id, route: ROUTE});
    
    return NextResponse.json({data}, {status: 200});
  } catch (error) {
    await logCritical({module: LogModule.INGREDIENT, source: LogSource.API, error, route: ROUTE, userId: auth.user!.id, tenantId: auth.tenant_id});
    return NextResponse.json({error: "api.errors.somethingWentWrong"}, {status: 500});
  }
}
