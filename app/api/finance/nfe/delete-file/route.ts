import {LogModule} from "@/src/lib/logger";
import {prisma} from "@/src/lib/prisma";
import {deleteFromR2, extractR2KeyFromUrl} from "@/src/lib/r2";
import {withAuth} from "@/src/lib/route-handler";
import {NextRequest} from "next/server";

const ROUTE = "/api/finance/nfe/delete-file";

export async function DELETE(req: NextRequest) {
  return withAuth(LogModule.NFE, ROUTE, async ({auth, success, error}) => {
    const {nfeId} = await req.json();

    if (!nfeId) return error("api.errors.missingRequiredFields", 400);

    const nfe = await prisma.nfe.findUnique({where: {id: nfeId, tenant_id: auth.tenant_id}});
    if (!nfe || !nfe.file_url) return error("api.errors.notFound", 404, {id: nfeId});

    const r2Key = extractR2KeyFromUrl(nfe.file_url);
    if (r2Key) {
      const deleted = await deleteFromR2(r2Key, auth.tenant_id);
      if (!deleted) return error("api.errors.deleteFailed", 400, {fileUrl: nfe.file_url});
    }

    await prisma.nfe.update({
      where: {id: nfeId, tenant_id: auth.tenant_id},
      data: {
        file_url: null,
        last_edit_date: new Date(),
        last_editor_id: auth.user.id,
      },
    });

    return success("delete", {nfeId});
  });
}
