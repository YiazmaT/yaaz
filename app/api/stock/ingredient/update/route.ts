import {LogModule} from "@/src/lib/logger";
import {prisma} from "@/src/lib/prisma";
import {deleteFromR2, extractR2KeyFromUrl} from "@/src/lib/r2";
import {withAuth} from "@/src/lib/route-handler";
import {NextRequest} from "next/server";

const ROUTE = "/api/stock/ingredient/update";

export async function PUT(req: NextRequest) {
  return withAuth(LogModule.INGREDIENT, ROUTE, async ({auth, success, error}) => {
    const {id, name, description, unitOfMeasureId, min_stock, imageUrl} = await req.json();

    if (!id || !name || !unitOfMeasureId) return error("api.errors.missingRequiredFields", 400);

    const existingIngredient = await prisma.ingredient.findUnique({where: {id, tenant_id: auth.tenant_id}});
    if (!existingIngredient) return error("api.errors.notFound", 404, {id});

    const ingredient = await prisma.ingredient.update({
      where: {id, tenant_id: auth.tenant_id},
      data: {
        name,
        description: description || null,
        unit_of_measure_id: unitOfMeasureId,
        min_stock: min_stock || "0",
        image: imageUrl ?? null,
        last_edit_date: new Date(),
        last_editor_id: auth.user.id,
      },
      include: {unity_of_measure: {select: {id: true, unity: true}}},
    });

    if (existingIngredient.image && existingIngredient.image !== imageUrl) {
      const oldKey = extractR2KeyFromUrl(existingIngredient.image);
      if (oldKey) await deleteFromR2(oldKey, auth.tenant_id);
    }

    return success("update", ingredient, {before: existingIngredient, after: ingredient});
  });
}
