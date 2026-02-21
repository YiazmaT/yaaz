import Decimal from "decimal.js";
import {LogModule} from "@/src/lib/logger";
import {prisma} from "@/src/lib/prisma";
import {deleteFromR2, extractR2KeyFromUrl} from "@/src/lib/r2";
import {withAuth} from "@/src/lib/route-handler";
import {DeleteIngredientDto} from "@/src/pages-content/stock/ingredients/dto";
import {NextRequest} from "next/server";

const ROUTE = "/api/stock/ingredient/delete";

export async function DELETE(req: NextRequest) {
  return withAuth(LogModule.INGREDIENT, ROUTE, async ({auth, success, error}) => {
    const {id}: DeleteIngredientDto = await req.json();

    if (!id) return error("api.errors.missingRequiredFields", 400);

    const ingredient = await prisma.ingredient.findUnique({
      where: {id, tenant_id: auth.tenant_id},
      include: {
        products: {
          take: 10,
          include: {product: {select: {name: true}}},
        },
      },
    });

    if (!ingredient) return error("api.errors.notFound", 404, {id});
    if (new Decimal(ingredient.stock).greaterThan(0))
      return error("ingredients.errors.cannotDeleteWithStock", 400, {id, name: ingredient.name, stock: ingredient.stock});

    if (ingredient.products.length > 0) {
      const total = await prisma.productIngredient.count({where: {ingredient_id: id, tenant_id: auth.tenant_id}});
      const products = ingredient.products.map((p) => p.product.name);
      return error("ingredients.errors.inUseByProducts", 400, {id, ingredient, products, total}, {products, total});
    }

    if (ingredient.image) {
      const key = extractR2KeyFromUrl(ingredient.image);
      if (key) {
        const deleted = await deleteFromR2(key, auth.tenant_id);
        if (!deleted) return error("api.errors.deleteFailed", 400, {fileUrl: ingredient.image});
      }
    }

    await prisma.ingredient.delete({where: {id}});

    return success("delete", ingredient);
  });
}
