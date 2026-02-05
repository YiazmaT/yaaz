import {authenticateRequest} from "@/src/lib/auth";
import {logCritical, logError, LogModule, LogSource, logDelete} from "@/src/lib/logger";
import {prisma} from "@/src/lib/prisma";
import {deleteFromR2, extractR2KeyFromUrl} from "@/src/lib/r2";
import {DeletePackageDto} from "@/src/pages-content/packages/dto";
import {NextRequest, NextResponse} from "next/server";

const ROUTE = "/api/package/delete";

export async function DELETE(req: NextRequest) {
  const auth = await authenticateRequest(LogModule.PACKAGE, ROUTE);
  if (auth.error) return auth.error;

  try {
    const {id}: DeletePackageDto = await req.json();

    if (!id) {
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

    const pkg = await prisma.package.findUnique({
      where: {id, tenant_id: auth.tenant_id},
      include: {products: {take: 1}, sales: {take: 1}},
    });

    if (!pkg) {
      logError({
        module: LogModule.PACKAGE,
        source: LogSource.API,
        message: "Package not found",
        content: {id},
        route: ROUTE,
        userId: auth.user!.id,
        tenantId: auth.tenant_id,
      });
      return NextResponse.json({error: "api.errors.dataNotFound"}, {status: 404});
    }

    if (pkg.products.length > 0) {
      logError({
        module: LogModule.PACKAGE,
        source: LogSource.API,
        message: "Package is in use by products",
        content: pkg,
        route: ROUTE,
        userId: auth.user!.id,
        tenantId: auth.tenant_id,
      });
      return NextResponse.json({error: "packages.errors.inUseByProducts"}, {status: 400});
    }

    if (pkg.sales.length > 0) {
      logError({
        module: LogModule.PACKAGE,
        source: LogSource.API,
        message: "Package is in use by sales",
        content: pkg,
        route: ROUTE,
        userId: auth.user!.id,
        tenantId: auth.tenant_id,
      });
      return NextResponse.json({error: "packages.errors.inUseBySales"}, {status: 400});
    }

    if (pkg.image) {
      const key = extractR2KeyFromUrl(pkg.image);
      if (key) {
        await deleteFromR2(key, auth.tenant_id);
      }
    }

    await prisma.package.delete({where: {id}});

    logDelete({
      module: LogModule.PACKAGE,
      source: LogSource.API,
      content: {package: pkg},
      route: ROUTE,
      userId: auth.user!.id,
      tenantId: auth.tenant_id,
    });

    return NextResponse.json({success: true}, {status: 200});
  } catch (error) {
    await logCritical({module: LogModule.PACKAGE, source: LogSource.API, error, route: ROUTE, userId: auth.user!.id, tenantId: auth.tenant_id});
    return NextResponse.json({error: "api.errors.somethingWentWrong"}, {status: 500});
  }
}
