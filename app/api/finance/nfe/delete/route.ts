import {LogModule} from "@/src/lib/logger";
import {prisma} from "@/src/lib/prisma";
import {deleteFromR2, extractR2KeyFromUrl} from "@/src/lib/r2";
import {withAuth} from "@/src/lib/route-handler";
import {NextRequest} from "next/server";

const ROUTE = "/api/finance/nfe/delete";

export async function DELETE(req: NextRequest) {
  return withAuth(LogModule.NFE, ROUTE, async ({auth, success, error}) => {
    const {id} = await req.json();

    if (!id) return error("api.errors.missingRequiredFields", 400);

    const nfe = await prisma.nfe.findUnique({
      where: {id, tenant_id: auth.tenant_id},
      include: {items: true},
    });
    if (!nfe) return error("api.errors.notFound", 404, {id});

    if (nfe.file_url) {
      const key = extractR2KeyFromUrl(nfe.file_url);
      if (key) {
        const deleted = await deleteFromR2(key, auth.tenant_id);
        if (!deleted) return error("api.errors.deleteFailed", 400, {fileUrl: nfe.file_url});
      }
    }

    const ops = [];
    if (nfe.stock_added) {
      for (const item of nfe.items) {
        if (item.item_type === "ingredient" && item.ingredient_id) {
          ops.push(
            prisma.ingredient.update({
              where: {id: item.ingredient_id},
              data: {stock: {decrement: item.quantity}},
            }),
          );
        } else if (item.item_type === "product" && item.product_id) {
          ops.push(
            prisma.product.update({
              where: {id: item.product_id},
              data: {stock: {decrement: item.quantity}},
            }),
          );
        } else if (item.item_type === "package" && item.package_id) {
          ops.push(
            prisma.package.update({
              where: {id: item.package_id},
              data: {stock: {decrement: item.quantity}},
            }),
          );
        }
      }
    }

    ops.push(prisma.nfe.delete({where: {id, tenant_id: auth.tenant_id}}));

    await prisma.$transaction(ops);

    return success("delete", nfe);
  });
}
