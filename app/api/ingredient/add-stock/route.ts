import {authenticateRequest} from "@/src/lib/auth";
import {logCreate, logCritical, logError, LogModule, LogSource} from "@/src/lib/logger";
import {prisma} from "@/src/lib/prisma";
import {AddStockDto} from "@/src/pages-content/ingredients/dto";
import {NextRequest, NextResponse} from "next/server";

const ROUTE = "/api/ingredient/add-stock";

export async function POST(req: NextRequest) {
  const auth = await authenticateRequest(LogModule.INGREDIENT, ROUTE);
  if (auth.error) return auth.error;

  try {
    const {items}: AddStockDto = await req.json();

    if (!items || !Array.isArray(items) || items.length === 0) {
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
          creator_id: auth.user!.id,
        },
      }),
    );

    const updated = await prisma.$transaction([...stockUpdates, ...costCreates]);

    logCreate({
      module: LogModule.INGREDIENT,
      source: LogSource.API,
      content: {items, stockUpdates, costCreates},
      route: ROUTE,
      userId: auth.user!.id,
      tenantId: auth.tenant_id,
    });

    return NextResponse.json({success: true, updated}, {status: 200});
  } catch (error) {
    await logCritical({module: LogModule.INGREDIENT, source: LogSource.API, error, route: ROUTE, userId: auth.user!.id, tenantId: auth.tenant_id});
    return NextResponse.json({error: "api.errors.somethingWentWrong"}, {status: 500});
  }
}
