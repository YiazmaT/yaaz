import {LogModule} from "@/src/lib/logger";
import {prisma} from "@/src/lib/prisma";
import {deleteFromR2, extractR2KeyFromUrl, uploadToR2} from "@/src/lib/r2";
import {withAuth} from "@/src/lib/route-handler";
import {NextRequest} from "next/server";

const ROUTE = "/api/finance/nfe/upload-file";
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "application/pdf"];

export async function POST(req: NextRequest) {
  return withAuth(LogModule.FINANCE, ROUTE, async ({auth, success, error}) => {
    const formData = await req.formData();
    const nfeId = formData.get("nfeId") as string;
    const file = formData.get("file") as File | null;

    if (!nfeId || !file || file.size === 0) return error("api.errors.missingRequiredFields", 400);

    if (!ALLOWED_TYPES.includes(file.type)) return error("finance.nfe.errors.invalidFileType", 400, {type: file.type});

    const nfe = await prisma.nfe.findUnique({where: {id: nfeId, tenant_id: auth.tenant_id}});
    if (!nfe) return error("api.errors.notFound", 404, {id: nfeId});

    if (nfe.file_url) {
      const oldKey = extractR2KeyFromUrl(nfe.file_url);
      if (oldKey) {
        const deleted = await deleteFromR2(oldKey, auth.tenant_id);
        if (!deleted) return error("api.errors.deleteFailed", 400, {fileUrl: nfe.file_url});
      }
    }

    const uploadResult = await uploadToR2(file, "nfe-files", auth.tenant_id);
    if (!uploadResult.success) {
      if (uploadResult.error === "FILE_TOO_LARGE") return error("global.errors.fileTooLarge", 400);
      return error("api.errors.uploadFailed", 400);
    }

    const updated = await prisma.nfe.update({
      where: {id: nfeId, tenant_id: auth.tenant_id},
      data: {
        file_url: uploadResult.url,
        last_edit_date: new Date(),
        last_editor_id: auth.user.id,
      },
    });

    return success("update", {file_url: updated.file_url});
  });
}
