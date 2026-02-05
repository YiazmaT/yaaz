import {authenticateRequest} from "@/src/lib/auth";
import {logCritical, logError, LogModule, LogSource, logUpdate} from "@/src/lib/logger";
import {prisma} from "@/src/lib/prisma";
import {NextRequest, NextResponse} from "next/server";

const ROUTE = "/api/product/toggle-active";

export async function PUT(req: NextRequest) {
  const auth = await authenticateRequest(LogModule.PRODUCT, ROUTE);
  if (auth.error) return auth.error;

  try {
    const {id} = await req.json();

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

    const existingProduct = await prisma.product.findUnique({where: {id, tenant_id: auth.tenant_id}});

    if (!existingProduct) {
      logError({
        module: LogModule.PRODUCT,
        source: LogSource.API,
        message: "Product not found",
        content: {id},
        route: ROUTE,
        userId: auth.user!.id,
        tenantId: auth.tenant_id,
      });
      return NextResponse.json({error: "api.errors.dataNotFound"}, {status: 404});
    }

    if (existingProduct.active && existingProduct.stock !== 0) {
      logError({
        module: LogModule.PRODUCT,
        source: LogSource.API,
        message: "Cannot deactivate product with stock",
        content: {id, stock: existingProduct.stock},
        route: ROUTE,
        userId: auth.user!.id,
        tenantId: auth.tenant_id,
      });
      return NextResponse.json({error: "products.errors.cannotDeactivateWithStock"}, {status: 400});
    }

    const product = await prisma.product.update({
      where: {id},
      data: {
        active: !existingProduct.active,
        last_edit_date: new Date(),
        last_editor_id: auth.user!.id,
      },
    });

    logUpdate({
      module: LogModule.PRODUCT,
      source: LogSource.API,
      content: {before: existingProduct, after: product},
      route: ROUTE,
      userId: auth.user!.id,
      tenantId: auth.tenant_id,
    });

    return NextResponse.json({success: true, product}, {status: 200});
  } catch (error) {
    await logCritical({module: LogModule.PRODUCT, source: LogSource.API, error, route: ROUTE, userId: auth.user!.id, tenantId: auth.tenant_id});
    return NextResponse.json({error: "api.errors.somethingWentWrong"}, {status: 500});
  }
}
