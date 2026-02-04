import {authenticateRequest} from "@/src/lib/auth";
import {logCritical, logError, LogModule, LogSource, logCreate} from "@/src/lib/logger";
import {prisma} from "@/src/lib/prisma";
import {uploadToR2} from "@/src/lib/r2";
import {CompositionItemDto, PackageCompositionItemDto} from "@/src/pages-content/products/dto";
import {NextRequest, NextResponse} from "next/server";

const ROUTE = "/api/product/create";

export async function POST(req: NextRequest) {
  const auth = await authenticateRequest(LogModule.PRODUCT, ROUTE);
  if (auth.error) return auth.error;

  try {
    const formData = await req.formData();
    const name = formData.get("name") as string;
    const price = parseFloat(formData.get("price") as string);
    const description = formData.get("description") as string | null;
    const min_stock = parseInt(formData.get("min_stock") as string) || 0;
    const image = formData.get("image") as File | null;
    const compositionJson = formData.get("composition") as string;
    const packagesJson = formData.get("packages") as string;

    if (!name || isNaN(price)) {
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

    let imageUrl: string | null = null;

    if (image && image.size > 0) {
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

    const product = await prisma.product.create({
      data: {
        tenant_id: auth.tenant_id,
        name,
        price,
        description: description || null,
        min_stock,
        image: imageUrl,
        creator_id: auth.user!.id,
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

    logCreate({module: LogModule.PRODUCT, source: LogSource.API, content: product, route: ROUTE, userId: auth.user!.id, tenantId: auth.tenant_id});

    return NextResponse.json({success: true, product}, {status: 200});
  } catch (error) {
    await logCritical({module: LogModule.PRODUCT, source: LogSource.API, error, route: ROUTE, userId: auth.user!.id, tenantId: auth.tenant_id});
    return NextResponse.json({error: "api.errors.somethingWentWrong"}, {status: 500});
  }
}
