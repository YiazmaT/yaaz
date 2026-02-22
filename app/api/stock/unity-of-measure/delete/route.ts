import {LogModule} from "@/src/lib/logger";
import {prisma} from "@/src/lib/prisma";
import {withAuth} from "@/src/lib/route-handler";
import {NextRequest} from "next/server";

const ROUTE = "/api/stock/unity-of-measure/delete";

export async function DELETE(req: NextRequest) {
  return withAuth(LogModule.UNITY_OF_MEASURE, ROUTE, async ({auth, success, error}) => {
    const {id} = await req.json();

    if (!id) return error("api.errors.missingRequiredFields", 400);

    const existing = await prisma.unityOfMeasure.findUnique({
      where: {id, tenant_id: auth.tenant_id},
      include: {
        products: {take: 10, select: {name: true}},
        packages: {take: 10, select: {name: true}},
        ingredients: {take: 10, select: {name: true}},
      },
    });

    if (!existing) return error("api.errors.dataNotFound", 404, {id});

    const hasProducts = existing.products.length > 0;
    const hasPackages = existing.packages.length > 0;
    const hasIngredients = existing.ingredients.length > 0;

    if (hasProducts || hasPackages || hasIngredients) {
      const [productTotal, packageTotal, ingredientTotal] = await Promise.all([
        prisma.product.count({where: {unit_of_measure_id: id, tenant_id: auth.tenant_id}}),
        prisma.package.count({where: {unit_of_measure_id: id, tenant_id: auth.tenant_id}}),
        prisma.ingredient.count({where: {unit_of_measure_id: id, tenant_id: auth.tenant_id}}),
      ]);

      return error(
        "unityOfMeasure.errors.inUse",
        400,
        {id},
        {
          products: existing.products.map((p) => p.name),
          packages: existing.packages.map((p) => p.name),
          ingredients: existing.ingredients.map((i) => i.name),
          total: productTotal + packageTotal + ingredientTotal,
        },
      );
    }

    await prisma.unityOfMeasure.delete({where: {id, tenant_id: auth.tenant_id}});

    return success("delete", existing);
  });
}
