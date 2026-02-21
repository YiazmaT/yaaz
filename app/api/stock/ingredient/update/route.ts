import {LogModule} from "@/src/lib/logger";
import {prisma} from "@/src/lib/prisma";
import {deleteFromR2, extractR2KeyFromUrl, uploadToR2} from "@/src/lib/r2";
import {withAuth} from "@/src/lib/route-handler";
import {NextRequest} from "next/server";

const ROUTE = "/api/stock/ingredient/update";

export async function PUT(req: NextRequest) {
  return withAuth(LogModule.INGREDIENT, ROUTE, async ({auth, success, error}) => {
    const formData = await req.formData();
    const id = formData.get("id") as string;
    const name = formData.get("name") as string;
    const description = formData.get("description") as string | null;
    const unitOfMeasureId = formData.get("unitOfMeasureId") as string;
    const min_stock = formData.get("min_stock") as string | null;
    const image = formData.get("image") as File | null;

    if (!id || !name || !unitOfMeasureId) return error("api.errors.missingRequiredFields", 400);

    const existingIngredient = await prisma.ingredient.findUnique({where: {id, tenant_id: auth.tenant_id}});
    if (!existingIngredient) return error("api.errors.notFound", 404, {id});

    let imageUrl: string | null = existingIngredient.image;

    if (image && image.size > 0) {
      if (existingIngredient.image) {
        const oldKey = extractR2KeyFromUrl(existingIngredient.image);
        if (oldKey) {
          const deleted = await deleteFromR2(oldKey, auth.tenant_id);
          if (!deleted) return error("api.errors.deleteFailed", 400, {fileUrl: existingIngredient.image});
        }
      }

      const uploadResult = await uploadToR2(image, "ingredients", auth.tenant_id);
      if (!uploadResult.success) {
        if (uploadResult.error === "FILE_TOO_LARGE") return error("global.errors.fileTooLarge", 400);
        return error("api.errors.uploadFailed", 400, uploadResult);
      }
      imageUrl = uploadResult.url!;
    }

    const ingredient = await prisma.ingredient.update({
      where: {id},
      data: {
        name,
        description: description || null,
        unit_of_measure_id: unitOfMeasureId,
        min_stock: min_stock || "0",
        image: imageUrl,
        last_edit_date: new Date(),
        last_editor_id: auth.user.id,
      },
      include: {unity_of_measure: {select: {id: true, unity: true}}},
    });

    return success("update", ingredient, {before: existingIngredient, after: ingredient});
  });
}
