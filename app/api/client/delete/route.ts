import {LogModule} from "@/src/lib/logger";
import {prisma} from "@/src/lib/prisma";
import {deleteFromR2, extractR2KeyFromUrl} from "@/src/lib/r2";
import {withAuth} from "@/src/lib/route-handler";
import {DeleteClientDto} from "@/src/pages-content/client/dto";
import {NextRequest, NextResponse} from "next/server";

const ROUTE = "/api/client/delete";

export async function DELETE(req: NextRequest) {
  return withAuth(LogModule.CLIENT, ROUTE, async (auth, log, error) => {
    const {id}: DeleteClientDto = await req.json();

    if (!id) return error("api.errors.missingRequiredFields", 400);

    const client = await prisma.client.findUnique({where: {id, tenant_id: auth.tenant_id}, include: {sales: {take: 1}}});
    if (!client) return error("api.errors.notFound", 404, {id});
    if (client.sales.length > 0) return error("clients.errors.inUseBySales", 400, {id, name: client.name});

    if (client.image) {
      const key = extractR2KeyFromUrl(client.image);
      if (key) {
        const deleted = await deleteFromR2(key, auth.tenant_id);
        if (!deleted) return error("api.errors.deleteFailed", 400, {fileUrl: client.image});
      }
    }

    await prisma.client.delete({where: {id}});

    log("delete", {content: client});

    return NextResponse.json({success: true}, {status: 200});
  });
}
