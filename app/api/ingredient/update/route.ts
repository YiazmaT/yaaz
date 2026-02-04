import {authenticateRequest} from "@/src/lib/auth";
import {logCritical, logError, LogModule, LogSource, logUpdate} from "@/src/lib/logger";
import {prisma} from "@/src/lib/prisma";
import {deleteFromR2, extractR2KeyFromUrl, uploadToR2} from "@/src/lib/r2";
import {NextRequest, NextResponse} from "next/server";

const ROUTE = "/api/ingredient/update";

export async function PUT(req: NextRequest) {
  const auth = await authenticateRequest(LogModule.INGREDIENT, ROUTE);
  if (auth.error) return auth.error;

  try {
    const formData = await req.formData();
    const id = formData.get("id") as string;
    const name = formData.get("name") as string;
    const description = formData.get("description") as string | null;
    const unitOfMeasure = formData.get("unitOfMeasure") as string;
    const min_stock = formData.get("min_stock") as string | null;
    const image = formData.get("image") as File | null;

    if (!id || !name || !unitOfMeasure) {
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

    const existingIngredient = await prisma.ingredient.findUnique({where: {id, tenant_id: auth.tenant_id}});

    if (!existingIngredient) {
      logError({
        module: LogModule.INGREDIENT,
        source: LogSource.API,
        message: "Ingredient not found",
        content: {id},
        route: ROUTE,
        userId: auth.user!.id,
        tenantId: auth.tenant_id,
      });
      return NextResponse.json({error: "api.errors.somethingWentWrong"}, {status: 404});
    }

    let imageUrl: string | null = existingIngredient.image;

    if (image && image.size > 0) {
      if (existingIngredient.image) {
        const oldKey = extractR2KeyFromUrl(existingIngredient.image);
        if (oldKey) {
          await deleteFromR2(oldKey, auth.tenant_id);
        }
      }

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

    const ingredient = await prisma.ingredient.update({
      where: {id},
      data: {
        name,
        description: description || null,
        unit_of_measure: unitOfMeasure,
        min_stock: min_stock || "0",
        image: imageUrl,
        last_edit_date: new Date(),
        last_editor_id: auth.user!.id,
      },
    });

    logUpdate({
      module: LogModule.INGREDIENT,
      source: LogSource.API,
      content: {before: existingIngredient, after: ingredient},
      route: ROUTE,
      userId: auth.user!.id,
      tenantId: auth.tenant_id,
    });

    return NextResponse.json({success: true, ingredient}, {status: 200});
  } catch (error) {
    await logCritical({module: LogModule.INGREDIENT, source: LogSource.API, error, route: ROUTE, userId: auth.user!.id, tenantId: auth.tenant_id});
    return NextResponse.json({error: "api.errors.somethingWentWrong"}, {status: 500});
  }
}
