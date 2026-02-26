import {LogModule} from "@/src/lib/logger";
import {deleteFromR2, extractR2KeyFromUrl} from "@/src/lib/r2";
import {withAuth} from "@/src/lib/route-handler";
import {NextRequest} from "next/server";

const ROUTE = "/api/upload/cleanup";

export async function DELETE(req: NextRequest) {
  return withAuth(LogModule.UPLOAD, ROUTE, async ({auth, success, error}) => {
    const {url} = await req.json();

    const key = url ? extractR2KeyFromUrl(url) : null;

    if (!key || !key.includes(`/${auth.tenant_id}/`)) {
      return error("api.errors.missingRequiredFields", 400, {url});
    }

    await deleteFromR2(key, auth.tenant_id);

    return success("delete", {key});
  });
}
