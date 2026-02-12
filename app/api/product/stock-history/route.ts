import {LogModule} from "@/src/lib/logger";
import {prisma} from "@/src/lib/prisma";
import {withAuth} from "@/src/lib/route-handler";
import {NextRequest} from "next/server";

const ROUTE = "/api/product/stock-history";

export async function GET(req: NextRequest) {
  return withAuth(LogModule.PRODUCT, ROUTE, async ({auth, success, error}) => {
    const {searchParams} = new URL(req.url);
    const productId = searchParams.get("productId");

    if (!productId) return error("api.errors.missingRequiredFields", 400);

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

    return success("get", history);
  });
}
