import {LogModule} from "@/src/lib/logger";
import {prisma} from "@/src/lib/prisma";
import {withAuth} from "@/src/lib/route-handler";
import {AddStockDto} from "@/src/pages-content/stock/packages/dto";
import {NextRequest} from "next/server";

const ROUTE = "/api/stock/package/add-stock";

export async function POST(req: NextRequest) {
  return withAuth(LogModule.PACKAGE, ROUTE, async ({auth, success, error}) => {
    const {items}: AddStockDto = await req.json();

    if (!items || !Array.isArray(items) || items.length === 0) {
      return error("api.errors.missingRequiredFields", 400);
    }

    const stockUpdates = items.map((item) =>
      prisma.package.update({
        where: {id: item.packageId},
        data: {stock: {increment: item.quantity}},
      }),
    );

    const costCreates = items.map((item) =>
      prisma.packageCost.create({
        data: {
          tenant_id: auth.tenant_id,
          package_id: item.packageId,
          quantity: item.quantity,
          price: item.cost ?? "0",
          creator_id: auth.user.id,
        },
      }),
    );

    const updated = await prisma.$transaction([...stockUpdates, ...costCreates]);

    return success("create", {items, updated, stockUpdates, costCreates});
  });
}
