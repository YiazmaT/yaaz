import {authenticateRequest} from "@/src/lib/auth";
import {logCritical, logError, logUpdate, LogModule, LogSource} from "@/src/lib/logger";
import {prisma} from "@/src/lib/prisma";
import {uploadToR2} from "@/src/lib/r2";
import {NextRequest, NextResponse} from "next/server";

const ROUTE = "/api/product/upload-file";
const MAX_FILES = 5;

export async function POST(req: NextRequest) {
  const auth = await authenticateRequest(LogModule.PRODUCT, ROUTE);
  if (auth.error) return auth.error;

  try {
    const formData = await req.formData();
    const productId = formData.get("productId") as string;
    const file = formData.get("file") as File | null;

    if (!productId || !file || file.size === 0) {
      logError({
        module: LogModule.PRODUCT,
        source: LogSource.API,
        message: "api.errors.missingRequiredFields",
        content: {productId, fileName: file?.name, fileSize: file?.size},
        route: ROUTE,
        userId: auth.user!.id,
        tenantId: auth.tenant_id,
      });
      return NextResponse.json({error: "api.errors.missingRequiredFields"}, {status: 400});
    }

    const product = await prisma.product.findFirst({where: {id: productId, tenant_id: auth.tenant_id}});

    if (!product) {
      logError({
        module: LogModule.PRODUCT,
        source: LogSource.API,
        message: "api.errors.notFound",
        content: {productId},
        route: ROUTE,
        userId: auth.user!.id,
        tenantId: auth.tenant_id,
      });
      return NextResponse.json({error: "api.errors.notFound"}, {status: 404});
    }

    if (product.files.length >= MAX_FILES) {
      logError({
        module: LogModule.PRODUCT,
        source: LogSource.API,
        message: "products.files.maxFiles",
        content: {productId, currentFiles: product.files.length, maxFiles: MAX_FILES},
        route: ROUTE,
        userId: auth.user!.id,
        tenantId: auth.tenant_id,
      });
      return NextResponse.json({error: "products.files.maxFiles"}, {status: 400});
    }

    const tenant = await prisma.tenant.findUnique({where: {id: auth.tenant_id}});
    const maxSizeBytes = (tenant?.max_file_size_in_mbs ?? 10) * 1024 * 1024;

    if (file.size > maxSizeBytes) {
      logError({
        module: LogModule.PRODUCT,
        source: LogSource.API,
        message: "products.files.fileTooLarge",
        content: {productId, fileSize: file.size, maxSizeBytes},
        route: ROUTE,
        userId: auth.user!.id,
        tenantId: auth.tenant_id,
      });
      return NextResponse.json({error: "products.files.fileTooLarge"}, {status: 400});
    }

    const uploadResult = await uploadToR2(file, "product-files", auth.tenant_id);

    if (!uploadResult.success) {
      logError({
        module: LogModule.PRODUCT,
        source: LogSource.API,
        message: "Failed to upload file to R2",
        content: uploadResult,
        route: ROUTE,
        userId: auth.user!.id,
        tenantId: auth.tenant_id,
      });
      return NextResponse.json({error: "products.files.uploadError"}, {status: 400});
    }

    const updated = await prisma.product.update({
      where: {id: productId},
      data: {
        files: {push: uploadResult.url!},
        last_edit_date: new Date(),
        last_editor_id: auth.user!.id,
      },
    });

    logUpdate({
      module: LogModule.PRODUCT,
      source: LogSource.API,
      content: {before: product.files, after: updated.files},
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
