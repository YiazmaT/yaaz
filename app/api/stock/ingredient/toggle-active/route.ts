import Decimal from "decimal.js";
import {LogModule} from "@/src/lib/logger";
import {prisma} from "@/src/lib/prisma";
import {withAuth} from "@/src/lib/route-handler";
import {NextRequest} from "next/server";

const ROUTE = "/api/stock/ingredient/toggle-active";

export async function PUT(req: NextRequest) {
  return withAuth(LogModule.INGREDIENT, ROUTE, async ({auth, success, error}) => {
    const {id} = await req.json();

    if (!id) return error("api.errors.missingRequiredFields", 400);

    const existingIngredient = await prisma.ingredient.findUnique({where: {id, tenant_id: auth.tenant_id}});
    if (!existingIngredient) return error("api.errors.dataNotFound", 404, {id});

    if (existingIngredient.active && new Decimal(existingIngredient.stock).greaterThan(0)) {
      return error("ingredients.errors.cannotDeactivateWithStock", 400, {id, stock: existingIngredient.stock});
    }

    const ingredient = await prisma.ingredient.update({
      where: {id, tenant_id: auth.tenant_id},
      data: {
        active: !existingIngredient.active,
        last_edit_date: new Date(),
        last_editor_id: auth.user.id,
      },
    });

    return success("update", ingredient, {before: existingIngredient, after: ingredient});
  });
}
