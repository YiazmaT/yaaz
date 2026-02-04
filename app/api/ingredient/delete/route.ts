import {authenticateRequest} from "@/src/lib/auth";
import {logCritical, logError, LogModule, LogSource, logDelete} from "@/src/lib/logger";
import {prisma} from "@/src/lib/prisma";
import {deleteFromR2, extractR2KeyFromUrl} from "@/src/lib/r2";
import {DeleteIngredientDto} from "@/src/pages-content/ingredients/dto";
import {NextRequest, NextResponse} from "next/server";

const ROUTE = "/api/ingredient/delete";

export async function DELETE(req: NextRequest) {
  const auth = await authenticateRequest(LogModule.INGREDIENT, ROUTE);
  if (auth.error) return auth.error;

  try {
    const {id}: DeleteIngredientDto = await req.json();

    if (!id) {
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

    const ingredient = await prisma.ingredient.findUnique({
      where: {id, tenant_id: auth.tenant_id},
      include: {products: {take: 1}},
    });

    if (!ingredient) {
      logError({
        module: LogModule.INGREDIENT,
        source: LogSource.API,
        message: "Ingredient not found",
        content: {id},
        route: ROUTE,
        userId: auth.user!.id,
        tenantId: auth.tenant_id,
      });
      return NextResponse.json({error: "api.errors.dataNotFound"}, {status: 404});
    }

    if (ingredient.products.length > 0) {
      logError({
        module: LogModule.INGREDIENT,
        source: LogSource.API,
        message: "Ingredient is in use by products",
        content: ingredient,
        route: ROUTE,
        userId: auth.user!.id,
        tenantId: auth.tenant_id,
      });
      return NextResponse.json({error: "ingredients.errors.inUseByProducts"}, {status: 400});
    }

    if (ingredient.image) {
      const key = extractR2KeyFromUrl(ingredient.image);
      if (key) {
        await deleteFromR2(key, auth.tenant_id);
      }
    }

    await prisma.ingredient.delete({where: {id}});

    logDelete({
      module: LogModule.INGREDIENT,
      source: LogSource.API,
      content: {ingredient},
      route: ROUTE,
      userId: auth.user!.id,
      tenantId: auth.tenant_id,
    });

    return NextResponse.json({success: true}, {status: 200});
  } catch (error) {
    await logCritical({module: LogModule.INGREDIENT, source: LogSource.API, error, route: ROUTE, userId: auth.user!.id, tenantId: auth.tenant_id});
    return NextResponse.json({error: "api.errors.somethingWentWrong"}, {status: 500});
  }
}
