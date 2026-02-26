import {LogModule} from "@/src/lib/logger";
import {prisma} from "@/src/lib/prisma";
import {withAuth} from "@/src/lib/route-handler";
import {NextRequest} from "next/server";

const ROUTE = "/api/stock/ingredient/create";

export async function POST(req: NextRequest) {
  return withAuth(LogModule.INGREDIENT, ROUTE, async ({auth, success, error}) => {
    const {name, description, unitOfMeasureId, min_stock, imageUrl} = await req.json();

    if (!name || !unitOfMeasureId) return error("api.errors.missingRequiredFields", 400);

    const maxCode = await prisma.ingredient.aggregate({where: {tenant_id: auth.tenant_id}, _max: {code: true}});
    const nextCode = (maxCode._max.code || 0) + 1;

    const ingredient = await prisma.ingredient.create({
      data: {
        tenant_id: auth.tenant_id,
        code: nextCode,
        name,
        description: description || null,
        unit_of_measure_id: unitOfMeasureId,
        min_stock: min_stock || "0",
        image: imageUrl || null,
        creator_id: auth.user.id,
      },
      include: {unity_of_measure: {select: {id: true, unity: true}}},
    });

    return success("create", ingredient);
  });
}
