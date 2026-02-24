import Decimal from "decimal.js";
import {LogModule} from "@/src/lib/logger";
import {prisma} from "@/src/lib/prisma";
import {withAuth} from "@/src/lib/route-handler";
import {NextRequest} from "next/server";

const ROUTE = "/api/stock/product/[id]/manufacture-cost";

export async function GET(_: NextRequest, {params}: {params: Promise<{id: string}>}) {
  return withAuth(LogModule.PRODUCT, ROUTE, async ({auth, success, error}) => {
    const {id} = await params;

    const product = await prisma.product.findUnique({
      where: {id, tenant_id: auth.tenant_id},
      include: {
        composition: {
          include: {
            ingredient: {
              include: {
                costs: {
                  where: {price: {gt: 0}},
                  orderBy: {creation_date: "desc"},
                  take: 1,
                },
                unity_of_measure: {select: {unity: true}},
              },
            },
          },
        },
        packages: {
          include: {
            package: {
              include: {
                costs: {
                  where: {price: {gt: 0}},
                  orderBy: {creation_date: "desc"},
                  take: 1,
                },
                unity_of_measure: {select: {unity: true}},
              },
            },
          },
        },
      },
    });

    if (!product) return error("api.errors.notFound", 404);

    const items: {id: string; name: string; unity: string; quantity: number; unitCost: number; totalCost: number}[] = [];
    let total = new Decimal(0);

    for (const comp of product.composition) {
      const lastCost = comp.ingredient.costs[0];
      const costPerUnit = lastCost ? new Decimal(lastCost.price).div(lastCost.quantity) : new Decimal(0);
      const qty = new Decimal(comp.quantity);
      const totalCost = costPerUnit.times(qty);
      total = total.plus(totalCost);
      items.push({
        id: comp.ingredient_id,
        name: comp.ingredient.name,
        unity: comp.ingredient.unity_of_measure?.unity ?? "",
        quantity: qty.toNumber(),
        unitCost: costPerUnit.toNumber(),
        totalCost: totalCost.toNumber(),
      });
    }

    for (const pkg of product.packages) {
      const lastCost = pkg.package.costs[0];
      const costPerUnit = lastCost ? new Decimal(lastCost.price).div(lastCost.quantity) : new Decimal(0);
      const qty = new Decimal(pkg.quantity);
      const totalCost = costPerUnit.times(qty);
      total = total.plus(totalCost);
      items.push({
        id: pkg.package_id,
        name: pkg.package.name,
        unity: pkg.package.unity_of_measure?.unity ?? "",
        quantity: qty.toNumber(),
        unitCost: costPerUnit.toNumber(),
        totalCost: totalCost.toNumber(),
      });
    }

    return success("get", {items, total: total.toNumber()});
  });
}
