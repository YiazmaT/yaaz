import {LogModule} from "@/src/lib/logger";
import {prisma} from "@/src/lib/prisma";
import {deleteFromR2, extractR2KeyFromUrl} from "@/src/lib/r2";
import {withAuth} from "@/src/lib/route-handler";
import {DeleteProductDto} from "@/src/pages-content/products/dto";
import {NextRequest, NextResponse} from "next/server";

const ROUTE = "/api/product/delete";

export async function DELETE(req: NextRequest) {
  return withAuth(LogModule.PRODUCT, ROUTE, async (auth, log, error) => {
    const {id}: DeleteProductDto = await req.json();

    if (!id) return error("api.errors.missingRequiredFields", 400);

    const product = await prisma.product.findUnique({
      where: {id, tenant_id: auth.tenant_id},
      include: {sale_items: {take: 1}},
    });

    if (!product) return error("api.errors.notFound", 404, {id});
    if (product.stock !== 0) return error("products.errors.cannotDeleteWithStock", 400, {id, name: product.name, stock: product.stock});
    if (product.sale_items.length > 0) return error("products.errors.inUseBySales", 400, {id, name: product.name});

    if (product.image) {
      const key = extractR2KeyFromUrl(product.image);
      if (key) {
        const deleted = await deleteFromR2(key, auth.tenant_id);
        if (!deleted) return error("api.errors.deleteFailed", 400, {fileUrl: product.image});
      }
    }

    for (const fileUrl of product.files) {
      const key = extractR2KeyFromUrl(fileUrl);
      if (key) {
        const deleted = await deleteFromR2(key, auth.tenant_id);
        if (!deleted) return error("api.errors.deleteFailed", 400, {fileUrl});
      }
    }

    await prisma.product.delete({where: {id}});

    log("delete", {content: product});

    return NextResponse.json({success: true}, {status: 200});
  });
}
