import Decimal from "decimal.js";
import {LogModule} from "@/src/lib/logger";
import {prisma} from "@/src/lib/prisma";
import {withAuth} from "@/src/lib/route-handler";
import {NextRequest} from "next/server";

const ROUTE = "/api/stock/product/[id]/cost-history";

export async function GET(_: NextRequest, {params}: {params: Promise<{id: string}>}) {
  return withAuth(LogModule.PRODUCT, ROUTE, async ({auth, success}) => {
    const {id} = await params;

    const costs = await prisma.productCost.findMany({
      where: {
        product_id: id,
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
