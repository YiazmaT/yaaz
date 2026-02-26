import {LogModule} from "@/src/lib/logger";
import {prisma} from "@/src/lib/prisma";
import {deleteFromR2, extractR2KeyFromUrl} from "@/src/lib/r2";
import {withAuth} from "@/src/lib/route-handler";
import {NextRequest} from "next/server";

const ROUTE = "/api/finance/nfe/register-file";

export async function POST(req: NextRequest) {
  return withAuth(LogModule.NFE, ROUTE, async ({auth, success, error}) => {
    const {nfeId, url} = await req.json();

    if (!nfeId || !url) {
      return error("api.errors.missingRequiredFields", 400, {nfeId, url});
    }

    if (!url.includes(`/${auth.tenant_id}/`)) {
      return error("api.errors.notFound", 404, {url});
    }

    const nfe = await prisma.nfe.findUnique({where: {id: nfeId, tenant_id: auth.tenant_id}});
    if (!nfe) return error("api.errors.notFound", 404, {nfeId});

    if (nfe.file_url) {
      const oldKey = extractR2KeyFromUrl(nfe.file_url);
      if (oldKey) await deleteFromR2(oldKey, auth.tenant_id);
    }

    const updated = await prisma.nfe.update({
      where: {id: nfeId, tenant_id: auth.tenant_id},
      data: {
        file_url: url,
        last_edit_date: new Date(),
        last_editor_id: auth.user.id,
      },
    });

    return success("update", {file_url: updated.file_url}, {before: {file_url: nfe.file_url}, after: {file_url: updated.file_url}});
  });
}
