import {LogModule} from "@/src/lib/logger";
import {prisma} from "@/src/lib/prisma";
import {deleteFromR2, extractR2KeyFromUrl} from "@/src/lib/r2";
import {withAuth} from "@/src/lib/route-handler";
import {CompositionItemDto, PackageCompositionItemDto} from "@/src/pages-content/stock/products/dto";
import {NextRequest} from "next/server";

const ROUTE = "/api/stock/product/update";

export async function PUT(req: NextRequest) {
  return withAuth(LogModule.PRODUCT, ROUTE, async ({auth, success, error}) => {
    const {id, name, price, description, min_stock, imageUrl, composition: compositionRaw, packages: packagesRaw, unitOfMeasureId, displayLandingPage} = await req.json();

    if (!id || !name || isNaN(price) || !unitOfMeasureId) return error("api.errors.missingRequiredFields", 400);

    const existingProduct = await prisma.product.findUnique({where: {id, tenant_id: auth.tenant_id}});
    if (!existingProduct) return error("api.errors.notFound", 404, {id});

    if (displayLandingPage === true && !existingProduct.display_landing_page) {
      const maxLandingPageProducts = parseInt(process.env.MAX_LANDING_PAGE_PRODUCTS || "9", 10);
      const currentCount = await prisma.product.count({where: {display_landing_page: true, tenant_id: auth.tenant_id}});

      if (currentCount >= maxLandingPageProducts) {
        return error("products.errors.landingPageLimitReached", 400, {id, maxLandingPageProducts, currentCount});
      }
    }

    const composition: CompositionItemDto[] = compositionRaw || [];
    const packages: PackageCompositionItemDto[] = packagesRaw || [];

    await prisma.productIngredient.deleteMany({where: {product_id: id, tenant_id: auth.tenant_id}});
    await prisma.productPackage.deleteMany({where: {product_id: id, tenant_id: auth.tenant_id}});

    const product = await prisma.product.update({
      where: {id, tenant_id: auth.tenant_id},
      data: {
        name,
        price,
        description: description || null,
        min_stock: min_stock || 0,
        image: imageUrl ?? null,
        unit_of_measure_id: unitOfMeasureId || null,
        ...(displayLandingPage !== undefined && {display_landing_page: displayLandingPage}),
        last_edit_date: new Date(),
        last_editor_id: auth.user.id,
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
        composition: {include: {ingredient: true}},
        packages: {include: {package: true}},
      },
    });

    if (existingProduct.image && existingProduct.image !== imageUrl) {
      const oldKey = extractR2KeyFromUrl(existingProduct.image);
      if (oldKey) await deleteFromR2(oldKey, auth.tenant_id);
    }

    return success("update", product, {before: existingProduct, after: product});
  });
}
