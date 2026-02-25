import {LogModule} from "@/src/lib/logger";
import {prisma} from "@/src/lib/prisma";
import {withAuth} from "@/src/lib/route-handler";
import {NextRequest} from "next/server";

const ROUTE = "/api/stock/product/toggle-active";

export async function PUT(req: NextRequest) {
  return withAuth(LogModule.PRODUCT, ROUTE, async ({auth, success, error}) => {
    const {id} = await req.json();

    if (!id) return error("api.errors.missingRequiredFields", 400);

    const existingProduct = await prisma.product.findUnique({where: {id, tenant_id: auth.tenant_id}});
    if (!existingProduct) return error("api.errors.dataNotFound", 404, {id});

    if (existingProduct.active && Number(existingProduct.stock) !== 0) {
      return error("products.errors.cannotDeactivateWithStock", 400, {id, stock: existingProduct.stock});
    }

    const product = await prisma.product.update({
      where: {id, tenant_id: auth.tenant_id},
      data: {
        active: !existingProduct.active,
        last_edit_date: new Date(),
        last_editor_id: auth.user.id,
      },
    });

    return success("update", product, {before: existingProduct, after: product});
  });
}
