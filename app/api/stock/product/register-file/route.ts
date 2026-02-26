import {LogModule} from "@/src/lib/logger";
import {prisma} from "@/src/lib/prisma";
import {withAuth} from "@/src/lib/route-handler";
import {NextRequest} from "next/server";

const ROUTE = "/api/stock/product/register-file";
const MAX_FILES = 5;

export async function POST(req: NextRequest) {
  return withAuth(LogModule.PRODUCT, ROUTE, async ({auth, success, error}) => {
    const {productId, key} = await req.json();

    if (!productId || !key) {
      return error("api.errors.missingRequiredFields", 400, {productId, key});
    }

    if (!key.includes(`/${auth.tenant_id}/`)) {
      return error("api.errors.notFound", 404, {key});
    }

    const product = await prisma.product.findFirst({where: {id: productId, tenant_id: auth.tenant_id}});
    if (!product) return error("api.errors.notFound", 404, {productId});

    if (product.files.length >= MAX_FILES) {
      return error("products.files.maxFiles", 400, {productId, currentFiles: product.files.length, maxFiles: MAX_FILES});
    }

    const url = `${process.env.R2_PUBLIC_URL}/${key}`;

    const updated = await prisma.product.update({
      where: {id: productId, tenant_id: auth.tenant_id},
      data: {
        files: {push: url},
        last_edit_date: new Date(),
        last_editor_id: auth.user.id,
      },
    });

    return success("update", updated.files, {before: product.files, after: updated.files});
  });
}
