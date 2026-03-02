import {LogModule} from "@/src/lib/logger";
import {prisma} from "@/src/lib/prisma";
import {deleteFromR2} from "@/src/lib/r2";
import {withAuth} from "@/src/lib/route-handler";
import {DeleteProductFileDto} from "@/src/pages-content/stock/products/dto";
import {NextRequest} from "next/server";

const ROUTE = "/api/stock/product/delete-file";
const KEY = "stock.products";
const ACTION = "delete";

export async function DELETE(req: NextRequest) {
  return withAuth(LogModule.PRODUCT, ROUTE, {key: KEY, action: ACTION}, async ({auth, success, error}) => {
    const body: DeleteProductFileDto = await req.json();

    if (!body.productId || !body.fileUrl) return error("api.errors.missingRequiredFields", 400);

    const product = await prisma.product.findFirst({where: {id: body.productId, tenant_id: auth.tenant_id}});
    if (!product) return error("api.errors.notFound", 404, {id: body.productId});
    if (!product.files.includes(body.fileUrl)) return error("api.errors.notFound", 404, {id: body.fileUrl});

    const queued = await deleteFromR2(body.fileUrl, auth.tenant_id, auth.user.id);
    if (!queued) return error("api.errors.deleteFailed", 400, {fileUrl: body.fileUrl});

    const updatedFiles = product.files.filter((f) => f !== body.fileUrl);

    const updated = await prisma.product.update({
      where: {id: body.productId, tenant_id: auth.tenant_id},
      data: {
        files: updatedFiles,
        last_edit_date: new Date(),
        last_editor_id: auth.user.id,
      },
    });

    return success("delete", updated.files);
  });
}
