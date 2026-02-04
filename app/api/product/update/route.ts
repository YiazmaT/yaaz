import {authenticateRequest} from "@/src/lib/auth";
import {logCritical, logError, LogModule, LogSource, logUpdate} from "@/src/lib/logger";
import {prisma} from "@/src/lib/prisma";
import {deleteFromR2, extractR2KeyFromUrl, uploadToR2} from "@/src/lib/r2";
import {CompositionItemDto, PackageCompositionItemDto} from "@/src/pages-content/products/dto";
import {NextRequest, NextResponse} from "next/server";

const ROUTE = "/api/product/update";

export async function PUT(req: NextRequest) {
  const auth = await authenticateRequest(LogModule.PRODUCT, ROUTE);
  if (auth.error) return auth.error;

  try {
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

    if (!id || !name || isNaN(price)) {
      logError({
        module: LogModule.PRODUCT,
        source: LogSource.API,
        message: "api.errors.missingRequiredFields",
        route: ROUTE,
        userId: auth.user!.id,
        tenantId: auth.tenant_id,
      });
      return NextResponse.json({error: "api.errors.missingRequiredFields"}, {status: 400});
    }

    const existingProduct = await prisma.product.findUnique({where: {id, tenant_id: auth.tenant_id}});

    if (!existingProduct) {
      logError({
        module: LogModule.PRODUCT,
        source: LogSource.API,
        message: "Product not found",
        content: {id},
        route: ROUTE,
        userId: auth.user!.id,
        tenantId: auth.tenant_id,
      });
      return NextResponse.json({error: "api.errors.somethingWentWrong"}, {status: 404});
    }

    if (displayLandingPage === true && !existingProduct.display_landing_page) {
      const maxLandingPageProducts = parseInt(process.env.MAX_LANDING_PAGE_PRODUCTS || "9", 10);
      const currentCount = await prisma.product.count({where: {display_landing_page: true, tenant_id: auth.tenant_id}});

      if (currentCount >= maxLandingPageProducts) {
        logError({
          module: LogModule.PRODUCT,
          source: LogSource.API,
          message: "products.errors.landingPageLimitReached",
          content: {id, maxLandingPageProducts, currentCount},
          route: ROUTE,
          userId: auth.user!.id,
          tenantId: auth.tenant_id,
        });
        return NextResponse.json({error: "products.errors.landingPageLimitReached", maxLandingPageProducts}, {status: 400});
      }
    }

    let imageUrl: string | null = existingProduct.image;

    if (image && image.size > 0) {
      if (existingProduct.image) {
        const oldKey = extractR2KeyFromUrl(existingProduct.image);
        if (oldKey) {
          await deleteFromR2(oldKey, auth.tenant_id);
        }
      }

      const uploadResult = await uploadToR2(image, "products", auth.tenant_id);

      if (!uploadResult.success) {
        logError({
          module: LogModule.PRODUCT,
          source: LogSource.API,
          message: "Failed to upload image to R2",
          content: uploadResult,
          route: ROUTE,
          userId: auth.user!.id,
          tenantId: auth.tenant_id,
        });
        return NextResponse.json({error: "api.errors.somethingWentWrong"}, {status: 400});
      }

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
        last_editor_id: auth.user!.id,
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

    logUpdate({
      module: LogModule.PRODUCT,
      source: LogSource.API,
      content: {before: existingProduct, after: product},
      route: ROUTE,
      userId: auth.user!.id,
      tenantId: auth.tenant_id,
    });

    return NextResponse.json({success: true, product}, {status: 200});
  } catch (error) {
    await logCritical({module: LogModule.PRODUCT, source: LogSource.API, error, route: ROUTE, userId: auth.user!.id, tenantId: auth.tenant_id});
    return NextResponse.json({error: "api.errors.somethingWentWrong"}, {status: 500});
  }
}
