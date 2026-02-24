import {LogModule} from "@/src/lib/logger";
import {prisma} from "@/src/lib/prisma";
import {withAuth} from "@/src/lib/route-handler";
import {NextRequest} from "next/server";

const ROUTE = "/api/stock/package/stock-history";

export async function GET(req: NextRequest) {
  return withAuth(LogModule.PACKAGE, ROUTE, async ({auth, success, error}) => {
    const {searchParams} = new URL(req.url);
    const packageId = searchParams.get("packageId");

    if (!packageId) return error("api.errors.missingRequiredFields", 400);

    const [stockChanges, stockCosts] = await Promise.all([
      prisma.packageStockChange.findMany({
        where: {package_id: packageId, tenant_id: auth.tenant_id},
        orderBy: {creation_date: "desc"},
        take: 50,
        include: {
          creator: {
            select: {name: true},
          },
        },
      }),
      prisma.packageCost.findMany({
        where: {package_id: packageId, tenant_id: auth.tenant_id},
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
        comment: cost.comment ?? null,
        date: cost.creation_date,
        userName: cost.creator?.name ?? null,
      })),
    ];

    history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return success("get", history);
  });
}
