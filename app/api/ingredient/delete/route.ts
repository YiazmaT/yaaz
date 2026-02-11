import {LogModule} from "@/src/lib/logger";
import {prisma} from "@/src/lib/prisma";
import {deleteFromR2, extractR2KeyFromUrl} from "@/src/lib/r2";
import {withAuth} from "@/src/lib/route-handler";
import {DeleteIngredientDto} from "@/src/pages-content/ingredients/dto";
import {NextRequest, NextResponse} from "next/server";

const ROUTE = "/api/ingredient/delete";

export async function DELETE(req: NextRequest) {
  return withAuth(LogModule.INGREDIENT, ROUTE, async (auth, log, error) => {
    const {id}: DeleteIngredientDto = await req.json();

    if (!id) return error("api.errors.missingRequiredFields", 400);

    const ingredient = await prisma.ingredient.findUnique({
      where: {id, tenant_id: auth.tenant_id},
      include: {products: {take: 1}},
    });

    if (!ingredient) return error("api.errors.notFound", 404, {id});
    if (ingredient.products.length > 0) return error("ingredients.errors.inUseByProducts", 400, {id, name: ingredient.name});

    if (ingredient.image) {
      const key = extractR2KeyFromUrl(ingredient.image);
      if (key) {
        const deleted = await deleteFromR2(key, auth.tenant_id);
        if (!deleted) return error("api.errors.deleteFailed", 400, {fileUrl: ingredient.image});
      }
    }

    await prisma.ingredient.delete({where: {id}});

    log("delete", {content: ingredient});

    return NextResponse.json({success: true}, {status: 200});
  });
}
