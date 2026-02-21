import {PackageType} from "@prisma/client";
import {LogModule} from "@/src/lib/logger";
import {prisma} from "@/src/lib/prisma";
import {deleteFromR2, extractR2KeyFromUrl, uploadToR2} from "@/src/lib/r2";
import {withAuth} from "@/src/lib/route-handler";
import {NextRequest} from "next/server";

const ROUTE = "/api/stock/package/update";

export async function PUT(req: NextRequest) {
  return withAuth(LogModule.PACKAGE, ROUTE, async ({auth, success, error}) => {
    const formData = await req.formData();
    const id = formData.get("id") as string;
    const name = formData.get("name") as string;
    const description = formData.get("description") as string | null;
    const type = formData.get("type") as PackageType;
    const min_stock = formData.get("min_stock") as string | null;
    const image = formData.get("image") as File | null;
    const unitOfMeasureId = formData.get("unitOfMeasureId") as string | null;

    if (!id || !name || !type || !unitOfMeasureId) return error("api.errors.missingRequiredFields", 400);

    const existingPackage = await prisma.package.findUnique({where: {id, tenant_id: auth.tenant_id}});
    if (!existingPackage) return error("api.errors.notFound", 404, {id});

    let imageUrl: string | null = existingPackage.image;

    if (image && image.size > 0) {
      if (existingPackage.image) {
        const oldKey = extractR2KeyFromUrl(existingPackage.image);
        if (oldKey) {
          const deleted = await deleteFromR2(oldKey, auth.tenant_id);
          if (!deleted) return error("api.errors.deleteFailed", 400, {fileUrl: existingPackage.image});
        }
      }

      const uploadResult = await uploadToR2(image, "packages", auth.tenant_id);
      if (!uploadResult.success) {
        if (uploadResult.error === "FILE_TOO_LARGE") return error("global.errors.fileTooLarge", 400);
        return error("api.errors.uploadFailed", 400, uploadResult);
      }
      imageUrl = uploadResult.url!;
    }

    const pkg = await prisma.package.update({
      where: {id},
      data: {
        name,
        description: description || null,
        type,
        min_stock: min_stock || "0",
        image: imageUrl,
        unit_of_measure_id: unitOfMeasureId || null,
        last_edit_date: new Date(),
        last_editor_id: auth.user.id,
      },
      include: {unity_of_measure: {select: {id: true, unity: true}}},
    });

    return success("update", {package: pkg}, {before: existingPackage, after: pkg});
  });
}
