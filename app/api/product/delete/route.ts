import {authenticateRequest} from "@/src/lib/auth";
import {logCritical, logError, LogModule, LogSource, logDelete} from "@/src/lib/logger";
import {prisma} from "@/src/lib/prisma";
import {deleteFromR2, extractR2KeyFromUrl} from "@/src/lib/r2";
import {DeleteProductDto} from "@/src/pages-content/products/dto";
import {NextRequest, NextResponse} from "next/server";

const ROUTE = "/api/product/delete";

export async function DELETE(req: NextRequest) {
  const auth = await authenticateRequest(LogModule.PRODUCT, ROUTE);
  if (auth.error) return auth.error;

  try {
    const {id}: DeleteProductDto = await req.json();

    if (!id) {
      logError({
        module: LogModule.PRODUCT,
        source: LogSource.API,
        message: "api.errors.missingRequiredFields",
        route: ROUTE,
        userId: auth.user!.id,
        tenantId: auth.tenant_id,
      });
      return NextResponse.json({error: "api.errors.missingRequiredFields"}, {status: 400});
    }

    const product = await prisma.product.findUnique({
      where: {id, tenant_id: auth.tenant_id},
      include: {sale_items: {take: 1}},
    });

    if (!product) {
      logError({
        module: LogModule.PRODUCT,
        source: LogSource.API,
        message: "Product not found",
        content: {id},
        route: ROUTE,
        userId: auth.user!.id,
        tenantId: auth.tenant_id,
      });
      return NextResponse.json({error: "api.errors.somethingWentWrong"}, {status: 404});
    }

    if (product.stock !== 0) {
      logError({
        module: LogModule.PRODUCT,
        source: LogSource.API,
        message: "Cannot delete product with stock",
        content: {id, name: product.name, stock: product.stock},
        route: ROUTE,
        userId: auth.user!.id,
        tenantId: auth.tenant_id,
      });
      return NextResponse.json({error: "products.errors.cannotDeleteWithStock"}, {status: 400});
    }

    if (product.sale_items.length > 0) {
      logError({
        module: LogModule.PRODUCT,
        source: LogSource.API,
        message: "Product is in use by sales",
        content: {id, name: product.name},
        route: ROUTE,
        userId: auth.user!.id,
        tenantId: auth.tenant_id,
      });
      return NextResponse.json({error: "products.errors.inUseBySales"}, {status: 400});
    }

    if (product.image) {
      const key = extractR2KeyFromUrl(product.image);
      if (key) {
        await deleteFromR2(key, auth.tenant_id);
      }
    }

    for (const fileUrl of product.files) {
      const key = extractR2KeyFromUrl(fileUrl);
      if (key) {
        await deleteFromR2(key, auth.tenant_id);
      }
    }

    await prisma.product.delete({where: {id}});

    logDelete({module: LogModule.PRODUCT, source: LogSource.API, content: product, route: ROUTE, userId: auth.user!.id, tenantId: auth.tenant_id});

    return NextResponse.json({success: true}, {status: 200});
  } catch (error) {
    await logCritical({module: LogModule.PRODUCT, source: LogSource.API, error, route: ROUTE, userId: auth.user!.id, tenantId: auth.tenant_id});
    return NextResponse.json({error: "api.errors.somethingWentWrong"}, {status: 500});
  }
}
