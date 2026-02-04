import {authenticateRequest} from "@/src/lib/auth";
import {logCreate, logCritical, logError, LogModule, LogSource} from "@/src/lib/logger";
import {prisma} from "@/src/lib/prisma";
import {StockChangeDto} from "@/src/pages-content/ingredients/dto";
import {IngredientStockChangeReason} from "@/src/pages-content/ingredients/types";
import {NextRequest, NextResponse} from "next/server";

const ROUTE = "/api/ingredient/stock-change";

export async function POST(req: NextRequest) {
  const auth = await authenticateRequest(LogModule.INGREDIENT, ROUTE);
  if (auth.error) return auth.error;

  try {
    const {ingredientId, newStock, reason, comment}: StockChangeDto = await req.json();

    if (!ingredientId || newStock === undefined || newStock === null || !reason) {
      logError({
        module: LogModule.INGREDIENT,
        source: LogSource.API,
        message: "api.errors.missingRequiredFields",
        route: ROUTE,
        userId: auth.user!.id,
        tenantId: auth.tenant_id,
      });
      return NextResponse.json({error: "api.errors.missingRequiredFields"}, {status: 400});
    }

    if (reason === IngredientStockChangeReason.other && !comment) {
      logError({
        module: LogModule.INGREDIENT,
        source: LogSource.API,
        message: "ingredients.stockChange.commentRequired",
        route: ROUTE,
        userId: auth.user!.id,
        tenantId: auth.tenant_id,
      });
      return NextResponse.json({error: "ingredients.stockChange.commentRequired"}, {status: 400});
    }

    const ingredient = await prisma.ingredient.findUnique({
      where: {id: ingredientId, tenant_id: auth.tenant_id},
      select: {stock: true},
    });

    if (!ingredient) {
      logError({
        module: LogModule.INGREDIENT,
        source: LogSource.API,
        message: "api.errors.dataNotFound",
        route: ROUTE,
        userId: auth.user!.id,
        tenantId: auth.tenant_id,
      });
      return NextResponse.json({error: "api.errors.dataNotFound"}, {status: 404});
    }

    const previousStock = ingredient.stock;

    await prisma.$transaction([
      prisma.ingredient.update({
        where: {id: ingredientId},
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
          creator_id: auth.user!.id,
        },
      }),
    ]);

    logCreate({
      module: LogModule.INGREDIENT,
      source: LogSource.API,
      content: {ingredientId, previousStock: previousStock.toString(), newStock, reason, comment},
      route: ROUTE,
      userId: auth.user!.id,
    });

    return NextResponse.json({success: true}, {status: 200});
  } catch (error) {
    await logCritical({module: LogModule.INGREDIENT, source: LogSource.API, error, route: ROUTE, userId: auth.user!.id, tenantId: auth.tenant_id});
    return NextResponse.json({error: "api.errors.somethingWentWrong"}, {status: 500});
  }
}
