import {authenticateRequest} from "@/src/lib/auth";
import {logCritical, logDelete, logError, LogModule, LogSource} from "@/src/lib/logger";
import {prisma} from "@/src/lib/prisma";
import {deleteFromR2, extractR2KeyFromUrl} from "@/src/lib/r2";
import {DeleteProductFileDto} from "@/src/pages-content/products/dto";
import {NextRequest, NextResponse} from "next/server";

const ROUTE = "/api/product/delete-file";

export async function DELETE(req: NextRequest) {
  const auth = await authenticateRequest(LogModule.PRODUCT, ROUTE);
  if (auth.error) return auth.error;

  try {
    const body: DeleteProductFileDto = await req.json();

    if (!body.productId || !body.fileUrl) {
      return NextResponse.json({error: "api.errors.missingRequiredFields"}, {status: 400});
    }

    const product = await prisma.product.findFirst({where: {id: body.productId, tenant_id: auth.tenant_id}});

    if (!product) {
      logError({
        module: LogModule.PRODUCT,
        source: LogSource.API,
        message: "Product not found",
        content: {id: body.productId},
        route: ROUTE,
        userId: auth.user!.id,
        tenantId: auth.tenant_id,
      });
      return NextResponse.json({error: "api.errors.notFound"}, {status: 404});
    }

    if (!product.files.includes(body.fileUrl)) {
      logError({
        module: LogModule.PRODUCT,
        source: LogSource.API,
        message: "URL not found",
        content: {id: body.fileUrl},
        route: ROUTE,
        userId: auth.user!.id,
        tenantId: auth.tenant_id,
      });
      return NextResponse.json({error: "api.errors.notFound"}, {status: 404});
    }

    const r2Key = extractR2KeyFromUrl(body.fileUrl);
    if (r2Key) {
      await deleteFromR2(r2Key, auth.tenant_id);
    }

    const updatedFiles = product.files.filter((f) => f !== body.fileUrl);

    const updated = await prisma.product.update({
      where: {id: body.productId},
      data: {
        files: updatedFiles,
        last_edit_date: new Date(),
        last_editor_id: auth.user!.id,
      },
    });

    logDelete({
      module: LogModule.PRODUCT,
      source: LogSource.API,
      content: {deletedFile: body.fileUrl, remainingFiles: updated.files},
      route: ROUTE,
      userId: auth.user!.id,
      tenantId: auth.tenant_id,
    });

    return NextResponse.json({files: updated.files}, {status: 200});
  } catch (error) {
    await logCritical({module: LogModule.PRODUCT, source: LogSource.API, error, route: ROUTE, userId: auth.user!.id, tenantId: auth.tenant_id});
    return NextResponse.json({error: "api.errors.somethingWentWrong"}, {status: 500});
  }
}
