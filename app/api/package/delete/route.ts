import {LogModule} from "@/src/lib/logger";
import {prisma} from "@/src/lib/prisma";
import {deleteFromR2, extractR2KeyFromUrl} from "@/src/lib/r2";
import {withAuth} from "@/src/lib/route-handler";
import {DeletePackageDto} from "@/src/pages-content/packages/dto";
import {NextRequest, NextResponse} from "next/server";

const ROUTE = "/api/package/delete";

export async function DELETE(req: NextRequest) {
  return withAuth(LogModule.PACKAGE, ROUTE, async (auth, log, error) => {
    const {id}: DeletePackageDto = await req.json();

    if (!id) return error("api.errors.missingRequiredFields", 400);

    const pkg = await prisma.package.findUnique({
      where: {id, tenant_id: auth.tenant_id},
      include: {products: {take: 1}, sales: {take: 1}},
    });

    if (!pkg) return error("api.errors.notFound", 404, {id});
    if (pkg.products.length > 0) return error("packages.errors.inUseByProducts", 400, {id, name: pkg.name});
    if (pkg.sales.length > 0) return error("packages.errors.inUseBySales", 400, {id, name: pkg.name});

    if (pkg.image) {
      const key = extractR2KeyFromUrl(pkg.image);
      if (key) {
        const deleted = await deleteFromR2(key, auth.tenant_id);
        if (!deleted) return error("api.errors.deleteFailed", 400, {fileUrl: pkg.image});
      }
    }

    await prisma.package.delete({where: {id}});

    log("delete", {content: pkg});

    return NextResponse.json({success: true}, {status: 200});
  });
}
