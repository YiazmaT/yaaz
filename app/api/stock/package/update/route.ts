import {PackageType} from "@prisma/client";
import {LogModule} from "@/src/lib/logger";
import {prisma} from "@/src/lib/prisma";
import {deleteFromR2, extractR2KeyFromUrl} from "@/src/lib/r2";
import {withAuth} from "@/src/lib/route-handler";
import {NextRequest} from "next/server";

const ROUTE = "/api/stock/package/update";

export async function PUT(req: NextRequest) {
  return withAuth(LogModule.PACKAGE, ROUTE, async ({auth, success, error}) => {
    const {id, name, description, type, min_stock, imageUrl, unitOfMeasureId} = await req.json();

    if (!id || !name || !type || !unitOfMeasureId) return error("api.errors.missingRequiredFields", 400);

    const existingPackage = await prisma.package.findUnique({where: {id, tenant_id: auth.tenant_id}});
    if (!existingPackage) return error("api.errors.notFound", 404, {id});

    const pkg = await prisma.package.update({
      where: {id, tenant_id: auth.tenant_id},
      data: {
        name,
        description: description || null,
        type,
        min_stock: min_stock || "0",
        image: imageUrl ?? null,
        unit_of_measure_id: unitOfMeasureId || null,
        last_edit_date: new Date(),
        last_editor_id: auth.user.id,
      },
      include: {unity_of_measure: {select: {id: true, unity: true}}},
    });

    if (existingPackage.image && existingPackage.image !== imageUrl) {
      const oldKey = extractR2KeyFromUrl(existingPackage.image);
      if (oldKey) await deleteFromR2(oldKey, auth.tenant_id);
    }

    return success("update", {package: pkg}, {before: existingPackage, after: pkg});
  });
}
