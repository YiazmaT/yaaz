import {LogModule} from "@/src/lib/logger";
import {prisma} from "@/src/lib/prisma";
import {withAuth} from "@/src/lib/route-handler";
import {AddStockDto} from "@/src/pages-content/ingredients/dto";
import {NextRequest, NextResponse} from "next/server";

const ROUTE = "/api/ingredient/add-stock";

export async function POST(req: NextRequest) {
  return withAuth(LogModule.INGREDIENT, ROUTE, async (auth, log, error) => {
    const {items}: AddStockDto = await req.json();

    if (!items || !Array.isArray(items) || items.length === 0) {
      return error("api.errors.missingRequiredFields", 400);
    }

    const stockUpdates = items.map((item) =>
      prisma.ingredient.update({
        where: {id: item.ingredientId},
        data: {stock: {increment: item.quantity}},
      }),
    );

    const costCreates = items.map((item) =>
      prisma.ingredientCost.create({
        data: {
          tenant_id: auth.tenant_id,
          ingredient_id: item.ingredientId,
          quantity: item.quantity,
          price: item.cost ?? "0",
          creator_id: auth.user.id,
        },
      }),
    );

    const updated = await prisma.$transaction([...stockUpdates, ...costCreates]);

    log("create", {content: {items, stockUpdates, costCreates}});

    return NextResponse.json({success: true, updated}, {status: 200});
  });
}
