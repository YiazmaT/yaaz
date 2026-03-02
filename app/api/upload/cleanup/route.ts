import {LogModule} from "@/src/lib/logger";
import {deleteFromR2} from "@/src/lib/r2";
import {withAuth} from "@/src/lib/route-handler";
import {NextRequest} from "next/server";

const ROUTE = "/api/upload/cleanup";

export async function DELETE(req: NextRequest) {
  return withAuth(LogModule.UPLOAD, ROUTE, null, async ({auth, success, error}) => {
    const {url} = await req.json();

    if (!url) return error("api.errors.missingRequiredFields", 400, {url});

    const queued = await deleteFromR2(url, auth.tenant_id, auth.user.id);
    if (!queued) return error("api.errors.deleteFailed", 400, {fileUrl: url});

    return success("delete", {url});
  });
}
