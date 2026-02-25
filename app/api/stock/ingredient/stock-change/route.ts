import {LogModule} from "@/src/lib/logger";
import {prisma} from "@/src/lib/prisma";
import {withAuth} from "@/src/lib/route-handler";
import {StockChangeDto} from "@/src/pages-content/stock/ingredients/dto";
import {IngredientStockChangeReason} from "@/src/pages-content/stock/ingredients/types";
import {NextRequest} from "next/server";

const ROUTE = "/api/stock/ingredient/stock-change";

export async function POST(req: NextRequest) {
  return withAuth(LogModule.INGREDIENT, ROUTE, async ({auth, success, error}) => {
    const {ingredientId, newStock, reason, comment}: StockChangeDto = await req.json();

    if (!ingredientId || newStock === undefined || newStock === null || !reason) {
      return error("api.errors.missingRequiredFields", 400);
    }

    if (reason === IngredientStockChangeReason.other && !comment) {
      return error("ingredients.stockChange.commentRequired", 400);
    }

    const ingredient = await prisma.ingredient.findUnique({
      where: {id: ingredientId, tenant_id: auth.tenant_id},
      select: {stock: true},
    });

    if (!ingredient) return error("api.errors.notFound", 404);

    const previousStock = ingredient.stock;

    await prisma.$transaction([
      prisma.ingredient.update({
        where: {id: ingredientId, tenant_id: auth.tenant_id},
        data: {stock: newStock},
      }),
      prisma.ingredientStockChange.create({
        data: {
          tenant_id: auth.tenant_id,
          ingredient_id: ingredientId,
          previous_stock: previousStock,
          new_stock: newStock,
          reason: reason as any,
          comment: comment || null,
          creator_id: auth.user.id,
        },
      }),
    ]);

    return success("create", {ingredientId, previousStock: previousStock.toString(), newStock, reason, comment});
  });
}
