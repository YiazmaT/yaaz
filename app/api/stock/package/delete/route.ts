import Decimal from "decimal.js";
import {LogModule} from "@/src/lib/logger";
import {prisma} from "@/src/lib/prisma";
import {deleteFromR2, extractR2KeyFromUrl} from "@/src/lib/r2";
import {withAuth} from "@/src/lib/route-handler";
import {DeletePackageDto} from "@/src/pages-content/stock/packages/dto";
import {NextRequest} from "next/server";

const ROUTE = "/api/stock/package/delete";

export async function DELETE(req: NextRequest) {
  return withAuth(LogModule.PACKAGE, ROUTE, async ({auth, success, error}) => {
    const {id}: DeletePackageDto = await req.json();

    if (!id) return error("api.errors.missingRequiredFields", 400);

    const pkg = await prisma.package.findUnique({
      where: {id, tenant_id: auth.tenant_id},
      include: {
        products: {
          take: 10,
          include: {product: {select: {name: true}}},
        },
        sales: {
          take: 10,
          include: {sale: {select: {id: true}}},
        },
      },
    });

    if (!pkg) return error("api.errors.notFound", 404, {id});
    if (new Decimal(pkg.stock).greaterThan(0)) return error("packages.errors.cannotDeleteWithStock", 400, {id, name: pkg.name, stock: pkg.stock});

    if (pkg.products.length > 0) {
      const total = await prisma.productPackage.count({where: {package_id: id, tenant_id: auth.tenant_id}});
      const products = pkg.products.map((p) => p.product.name);
      return error("packages.errors.inUseByProducts", 400, {id, name: pkg.name}, {products, total});
    }

    if (pkg.sales.length > 0) {
      const total = await prisma.salePackage.count({where: {package_id: id, tenant_id: auth.tenant_id}});
      const sales = pkg.sales.map((s) => s.sale.id.split("-").pop()!);
      return error("packages.errors.inUseBySales", 400, {id, name: pkg.name}, {sales, total});
    }

    if (pkg.image) {
      const key = extractR2KeyFromUrl(pkg.image);
      if (key) {
        const deleted = await deleteFromR2(key, auth.tenant_id);
        if (!deleted) return error("api.errors.deleteFailed", 400, {fileUrl: pkg.image});
      }
    }

    await prisma.package.delete({where: {id}});

    return success("delete", {package: pkg});
  });
}
