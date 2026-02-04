import {authenticateRequest} from "@/src/lib/auth";
import {logCritical, logError, LogModule, LogSource, logCreate} from "@/src/lib/logger";
import {prisma} from "@/src/lib/prisma";
import {uploadToR2} from "@/src/lib/r2";
import {NextRequest, NextResponse} from "next/server";

const ROUTE = "/api/ingredient/create";

export async function POST(req: NextRequest) {
  const auth = await authenticateRequest(LogModule.INGREDIENT, ROUTE);
  if (auth.error) return auth.error;

  try {
    const formData = await req.formData();
    const name = formData.get("name") as string;
    const description = formData.get("description") as string | null;
    const unitOfMeasure = formData.get("unitOfMeasure") as string;
    const min_stock = formData.get("min_stock") as string | null;
    const image = formData.get("image") as File | null;

    if (!name || !unitOfMeasure) {
      logError({
        module: LogModule.INGREDIENT,
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
      const uploadResult = await uploadToR2(image, "ingredients", auth.tenant_id);

      if (!uploadResult.success) {
        logError({
          module: LogModule.INGREDIENT,
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

    const ingredient = await prisma.ingredient.create({
      data: {
        tenant_id: auth.tenant_id,
        name,
        description: description || null,
        unit_of_measure: unitOfMeasure,
        min_stock: min_stock || "0",
        image: imageUrl,
        creator_id: auth.user!.id,
      },
    });

    logCreate({
      module: LogModule.INGREDIENT,
      source: LogSource.API,
      content: ingredient,
      route: ROUTE,
      userId: auth.user!.id,
      tenantId: auth.tenant_id,
    });

    return NextResponse.json({success: true, ingredient}, {status: 201});
  } catch (error) {
    await logCritical({module: LogModule.INGREDIENT, source: LogSource.API, error, route: ROUTE, userId: auth.user!.id, tenantId: auth.tenant_id});
    return NextResponse.json({error: "api.errors.somethingWentWrong"}, {status: 500});
  }
}
