import {LogModule} from "@/src/lib/logger";
import {prisma} from "@/src/lib/prisma";
import {deleteFromR2, extractR2KeyFromUrl, uploadToR2} from "@/src/lib/r2";
import {withAuth} from "@/src/lib/route-handler";
import {CompositionItemDto, PackageCompositionItemDto} from "@/src/pages-content/products/dto";
import {NextRequest, NextResponse} from "next/server";

const ROUTE = "/api/product/update";

export async function PUT(req: NextRequest) {
  return withAuth(LogModule.PRODUCT, ROUTE, async (auth, log, error) => {
    const formData = await req.formData();
    const id = formData.get("id") as string;
    const name = formData.get("name") as string;
    const price = parseFloat(formData.get("price") as string);
    const description = formData.get("description") as string | null;
    const min_stock = parseInt(formData.get("min_stock") as string) || 0;
    const image = formData.get("image") as File | null;
    const compositionJson = formData.get("composition") as string;
    const packagesJson = formData.get("packages") as string;
    const displayLandingPageRaw = formData.get("displayLandingPage") as string | null;
    const displayLandingPage = displayLandingPageRaw !== null ? displayLandingPageRaw === "true" : undefined;

    if (!id || !name || isNaN(price)) return error("api.errors.missingRequiredFields", 400);

    const existingProduct = await prisma.product.findUnique({where: {id, tenant_id: auth.tenant_id}});
    if (!existingProduct) return error("api.errors.notFound", 404, {id});

    if (displayLandingPage === true && !existingProduct.display_landing_page) {
      const maxLandingPageProducts = parseInt(process.env.MAX_LANDING_PAGE_PRODUCTS || "9", 10);
      const currentCount = await prisma.product.count({where: {display_landing_page: true, tenant_id: auth.tenant_id}});

      if (currentCount >= maxLandingPageProducts) {
        return error("products.errors.landingPageLimitReached", 400, {id, maxLandingPageProducts, currentCount});
      }
    }

    let imageUrl: string | null = existingProduct.image;

    if (image && image.size > 0) {
      if (existingProduct.image) {
        const oldKey = extractR2KeyFromUrl(existingProduct.image);
        if (oldKey) {
          const deleted = await deleteFromR2(oldKey, auth.tenant_id);
          if (!deleted) return error("api.errors.deleteFailed", 400, {fileUrl: existingProduct.image});
        }
      }

      const uploadResult = await uploadToR2(image, "products", auth.tenant_id);
      if (!uploadResult.success) return error("api.errors.uploadFailed", 400, uploadResult);
      imageUrl = uploadResult.url!;
    }

    const composition: CompositionItemDto[] = compositionJson ? JSON.parse(compositionJson) : [];
    const packages: PackageCompositionItemDto[] = packagesJson ? JSON.parse(packagesJson) : [];

    await prisma.productIngredient.deleteMany({where: {product_id: id}});
    await prisma.productPackage.deleteMany({where: {product_id: id}});

    const product = await prisma.product.update({
      where: {id},
      data: {
        name,
        price,
        description: description || null,
        min_stock,
        image: imageUrl,
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

    log("update", {content: {before: existingProduct, after: product}});

    return NextResponse.json({success: true, product}, {status: 200});
  });
}
