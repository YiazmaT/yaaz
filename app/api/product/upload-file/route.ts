import {LogModule} from "@/src/lib/logger";
import {prisma} from "@/src/lib/prisma";
import {uploadToR2} from "@/src/lib/r2";
import {withAuth} from "@/src/lib/route-handler";
import {NextRequest} from "next/server";

const ROUTE = "/api/product/upload-file";
const MAX_FILES = 5;

export async function POST(req: NextRequest) {
  return withAuth(LogModule.PRODUCT, ROUTE, async ({auth, success, error}) => {
    const formData = await req.formData();
    const productId = formData.get("productId") as string;
    const file = formData.get("file") as File | null;

    if (!productId || !file || file.size === 0) {
      return error("api.errors.missingRequiredFields", 400, {productId, fileName: file?.name, fileSize: file?.size});
    }

    const product = await prisma.product.findFirst({where: {id: productId, tenant_id: auth.tenant_id}});
    if (!product) return error("api.errors.notFound", 404, {productId});

    if (product.files.length >= MAX_FILES) {
      return error("products.files.maxFiles", 400, {productId, currentFiles: product.files.length, maxFiles: MAX_FILES});
    }

    const tenant = await prisma.tenant.findUnique({where: {id: auth.tenant_id}});
    const maxSizeBytes = (tenant?.max_file_size_in_mbs ?? 10) * 1024 * 1024;

    if (file.size > maxSizeBytes) {
      return error("products.files.fileTooLarge", 400, {productId, fileSize: file.size, maxSizeBytes});
    }

    const uploadResult = await uploadToR2(file, "product-files", auth.tenant_id);
    if (!uploadResult.success) return error("api.errors.uploadFailed", 400, uploadResult);

    const updated = await prisma.product.update({
      where: {id: productId},
      data: {
        files: {push: uploadResult.url!},
        last_edit_date: new Date(),
        last_editor_id: auth.user.id,
      },
    });

    return success("update", updated.files);
  });
}
