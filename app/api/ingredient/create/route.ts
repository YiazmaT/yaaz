import {LogModule} from "@/src/lib/logger";
import {prisma} from "@/src/lib/prisma";
import {uploadToR2} from "@/src/lib/r2";
import {withAuth} from "@/src/lib/route-handler";
import {NextRequest} from "next/server";

const ROUTE = "/api/ingredient/create";

export async function POST(req: NextRequest) {
  return withAuth(LogModule.INGREDIENT, ROUTE, async ({auth, success, error}) => {
    const formData = await req.formData();
    const name = formData.get("name") as string;
    const description = formData.get("description") as string | null;
    const unitOfMeasure = formData.get("unitOfMeasure") as string;
    const min_stock = formData.get("min_stock") as string | null;
    const image = formData.get("image") as File | null;

    if (!name || !unitOfMeasure) return error("api.errors.missingRequiredFields", 400);

    let imageUrl: string | null = null;

    if (image && image.size > 0) {
      const uploadResult = await uploadToR2(image, "ingredients", auth.tenant_id);
      if (!uploadResult.success) return error("api.errors.uploadFailed", 400, uploadResult);
      imageUrl = uploadResult.url!;
    }

    const ingredient = await prisma.ingredient.create({
      data: {
        tenant_id: auth.tenant_id,
        name,
        description: description || null,
        unit_of_measure: unitOfMeasure,
        min_stock: min_stock || "0",
        image: imageUrl,
        creator_id: auth.user.id,
      },
    });

    return success("create", ingredient);
  });
}
