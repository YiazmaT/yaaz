import {LogModule} from "@/src/lib/logger";
import {prisma} from "@/src/lib/prisma";
import {deleteFromR2} from "@/src/lib/r2";
import {withAuth} from "@/src/lib/route-handler";
import {DeleteProductDto} from "@/src/pages-content/stock/products/dto";
import {NextRequest} from "next/server";

const ROUTE = "/api/stock/product/delete";
const KEY = "stock.products";
const ACTION = "delete";

export async function DELETE(req: NextRequest) {
  return withAuth(LogModule.PRODUCT, ROUTE, {key: KEY, action: ACTION}, async ({auth, success, error}) => {
    const {id}: DeleteProductDto = await req.json();

    if (!id) return error("api.errors.missingRequiredFields", 400);

    const product = await prisma.product.findUnique({
      where: {id, tenant_id: auth.tenant_id},
      include: {
        sale_items: {
          take: 10,
          include: {sale: {select: {id: true}}},
          orderBy: {sale: {creation_date: "desc"}},
        },
      },
    });

    if (!product) return error("api.errors.notFound", 404, {id});
    if (Number(product.stock) !== 0) return error("products.errors.cannotDeleteWithStock", 400, {id, name: product.name, stock: product.stock});

    if (product.sale_items.length > 0) {
      const total = await prisma.saleItem.count({where: {product_id: id, tenant_id: auth.tenant_id}});
      const sales = product.sale_items.map((item) => item.sale.id.split("-").pop()!);
      return error("products.errors.inUseBySales", 400, {id, name: product.name}, {sales, total});
    }

    if (product.image) {
      const queued = await deleteFromR2(product.image, auth.tenant_id, auth.user.id);
      if (!queued) return error("api.errors.deleteFailed", 400, {fileUrl: product.image});
    }

    for (const fileUrl of product.files) {
      const queued = await deleteFromR2(fileUrl, auth.tenant_id, auth.user.id);
      if (!queued) return error("api.errors.deleteFailed", 400, {fileUrl});
    }

    await prisma.product.delete({where: {id, tenant_id: auth.tenant_id}});

    return success("delete", product);
  });
}
