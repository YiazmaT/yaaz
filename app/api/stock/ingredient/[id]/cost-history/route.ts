import Decimal from "decimal.js";
import {LogModule} from "@/src/lib/logger";
import {prisma} from "@/src/lib/prisma";
import {withAuth} from "@/src/lib/route-handler";
import {NextRequest} from "next/server";

const ROUTE = "/api/stock/ingredient/[id]/cost-history";

export async function GET(_: NextRequest, {params}: {params: Promise<{id: string}>}) {
  return withAuth(LogModule.INGREDIENT, ROUTE, async ({auth, success}) => {
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

    return success("get", data);
  });
}
