import {PackageType} from "@prisma/client";
import {authenticateRequest} from "@/src/lib/auth";
import {logCritical, logError, LogModule, LogSource, logUpdate} from "@/src/lib/logger";
import {prisma} from "@/src/lib/prisma";
import {deleteFromR2, extractR2KeyFromUrl, uploadToR2} from "@/src/lib/r2";
import {NextRequest, NextResponse} from "next/server";

const ROUTE = "/api/package/update";

export async function PUT(req: NextRequest) {
  const auth = await authenticateRequest(LogModule.PACKAGE, ROUTE);
  if (auth.error) return auth.error;

  try {
    const formData = await req.formData();
    const id = formData.get("id") as string;
    const name = formData.get("name") as string;
    const description = formData.get("description") as string | null;
    const type = formData.get("type") as PackageType;
    const min_stock = formData.get("min_stock") as string | null;
    const image = formData.get("image") as File | null;

    if (!id || !name || !type) {
      logError({
        module: LogModule.PACKAGE,
        source: LogSource.API,
        message: "api.errors.missingRequiredFields",
        route: ROUTE,
        userId: auth.user!.id,
        tenantId: auth.tenant_id,
      });
      return NextResponse.json({error: "api.errors.missingRequiredFields"}, {status: 400});
    }

    const existingPackage = await prisma.package.findUnique({where: {id, tenant_id: auth.tenant_id}});

    if (!existingPackage) {
      logError({
        module: LogModule.PACKAGE,
        source: LogSource.API,
        message: "Package not found",
        content: {id},
        route: ROUTE,
        userId: auth.user!.id,
        tenantId: auth.tenant_id,
      });
      return NextResponse.json({error: "api.errors.somethingWentWrong"}, {status: 404});
    }

    let imageUrl: string | null = existingPackage.image;

    if (image && image.size > 0) {
      if (existingPackage.image) {
        const oldKey = extractR2KeyFromUrl(existingPackage.image);
        if (oldKey) {
          await deleteFromR2(oldKey, auth.tenant_id);
        }
      }

      const uploadResult = await uploadToR2(image, "packages", auth.tenant_id);

      if (!uploadResult.success) {
        logError({
          module: LogModule.PACKAGE,
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

    const pkg = await prisma.package.update({
      where: {id},
      data: {
        name,
        description: description || null,
        type,
        min_stock: min_stock || "0",
        image: imageUrl,
        last_edit_date: new Date(),
        last_editor_id: auth.user!.id,
      },
    });

    logUpdate({
      module: LogModule.PACKAGE,
      source: LogSource.API,
      content: {before: existingPackage, after: pkg},
      route: ROUTE,
      userId: auth.user!.id,
      tenantId: auth.tenant_id,
    });

    return NextResponse.json({success: true, package: pkg}, {status: 200});
  } catch (error) {
    await logCritical({module: LogModule.PACKAGE, source: LogSource.API, error, route: ROUTE, userId: auth.user!.id, tenantId: auth.tenant_id});
    return NextResponse.json({error: "api.errors.somethingWentWrong"}, {status: 500});
  }
}
