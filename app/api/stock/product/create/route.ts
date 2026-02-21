import {LogModule} from "@/src/lib/logger";
import {prisma} from "@/src/lib/prisma";
import {uploadToR2} from "@/src/lib/r2";
import {withAuth} from "@/src/lib/route-handler";
import {CompositionItemDto, PackageCompositionItemDto} from "@/src/pages-content/stock/products/dto";
import {NextRequest} from "next/server";

const ROUTE = "/api/stock/product/create";

export async function POST(req: NextRequest) {
  return withAuth(LogModule.PRODUCT, ROUTE, async ({auth, success, error}) => {
    const formData = await req.formData();
    const name = formData.get("name") as string;
    const price = parseFloat(formData.get("price") as string);
    const description = formData.get("description") as string | null;
    const min_stock = parseInt(formData.get("min_stock") as string) || 0;
    const image = formData.get("image") as File | null;
    const compositionJson = formData.get("composition") as string;
    const packagesJson = formData.get("packages") as string;

    if (!name || isNaN(price)) return error("api.errors.missingRequiredFields", 400);

    let imageUrl: string | null = null;

    if (image && image.size > 0) {
      const uploadResult = await uploadToR2(image, "products", auth.tenant_id);
      if (!uploadResult.success) {
        if (uploadResult.error === "FILE_TOO_LARGE") return error("global.errors.fileTooLarge", 400);
        return error("api.errors.uploadFailed", 400, uploadResult);
      }
      imageUrl = uploadResult.url!;
    }

    const composition: CompositionItemDto[] = compositionJson ? JSON.parse(compositionJson) : [];
    const packages: PackageCompositionItemDto[] = packagesJson ? JSON.parse(packagesJson) : [];

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
        image: imageUrl,
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
