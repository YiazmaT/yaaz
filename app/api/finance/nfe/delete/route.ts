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

    await prisma.nfe.delete({where: {id, tenant_id: auth.tenant_id}});

    return success("delete", nfe);
  });
}
