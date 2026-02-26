import {LogModule} from "@/src/lib/logger";
import {prisma} from "@/src/lib/prisma";
import {withAuth} from "@/src/lib/route-handler";
import {CompositionItemDto, PackageCompositionItemDto} from "@/src/pages-content/stock/products/dto";
import {NextRequest} from "next/server";

const ROUTE = "/api/stock/product/create";

export async function POST(req: NextRequest) {
  return withAuth(LogModule.PRODUCT, ROUTE, async ({auth, success, error}) => {
    const {name, price, description, min_stock, imageUrl, composition: compositionRaw, packages: packagesRaw, unitOfMeasureId} = await req.json();

    if (!name || isNaN(price) || !unitOfMeasureId) return error("api.errors.missingRequiredFields", 400);

    const composition: CompositionItemDto[] = compositionRaw || [];
    const packages: PackageCompositionItemDto[] = packagesRaw || [];

    const maxCode = await prisma.product.aggregate({where: {tenant_id: auth.tenant_id}, _max: {code: true}});
    const nextCode = (maxCode._max.code || 0) + 1;

    const product = await prisma.product.create({
      data: {
        tenant_id: auth.tenant_id,
        code: nextCode,
        name,
        price,
        description: description || null,
        min_stock,
        image: imageUrl || null,
        unit_of_measure_id: unitOfMeasureId || null,
        creator_id: auth.user.id,
        composition: {
          create: composition.map((item) => ({
            tenant_id: auth.tenant_id,
            ingredient_id: item.ingredient.id,
            quantity: item.quantity,
          })),
        },
        packages: {
          create: packages.map((item) => ({
            tenant_id: auth.tenant_id,
            package_id: item.package.id,
            quantity: item.quantity,
          })),
        },
      },
      include: {
        unity_of_measure: {select: {id: true, unity: true}},
        composition: {
          include: {
            ingredient: true,
          },
        },
        packages: {
          include: {
            package: true,
          },
        },
      },
    });

    return success("create", product);
  });
}
