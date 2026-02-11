import {LogModule} from "@/src/lib/logger";
import {prisma} from "@/src/lib/prisma";
import {withAuth} from "@/src/lib/route-handler";
import {NextRequest, NextResponse} from "next/server";

const ROUTE = "/api/product/toggle-active";

export async function PUT(req: NextRequest) {
  return withAuth(LogModule.PRODUCT, ROUTE, async (auth, log, error) => {
    const {id} = await req.json();

    if (!id) return error("api.errors.missingRequiredFields", 400);

    const existingProduct = await prisma.product.findUnique({where: {id, tenant_id: auth.tenant_id}});
    if (!existingProduct) return error("api.errors.dataNotFound", 404, {id});

    if (existingProduct.active && existingProduct.stock !== 0) {
      return error("products.errors.cannotDeactivateWithStock", 400, {id, stock: existingProduct.stock});
    }

    const product = await prisma.product.update({
      where: {id},
      data: {
        active: !existingProduct.active,
        last_edit_date: new Date(),
        last_editor_id: auth.user.id,
      },
    });

    log("update", {content: {before: existingProduct, after: product}});

    return NextResponse.json({success: true, product}, {status: 200});
  });
}
