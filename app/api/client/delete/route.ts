import {LogModule} from "@/src/lib/logger";
import {prisma} from "@/src/lib/prisma";
import {deleteFromR2, extractR2KeyFromUrl} from "@/src/lib/r2";
import {withAuth} from "@/src/lib/route-handler";
import {DeleteClientDto} from "@/src/pages-content/client/dto";
import {NextRequest} from "next/server";

const ROUTE = "/api/client/delete";

export async function DELETE(req: NextRequest) {
  return withAuth(LogModule.CLIENT, ROUTE, async ({auth, success, error}) => {
    const {id}: DeleteClientDto = await req.json();

    if (!id) return error("api.errors.missingRequiredFields", 400);

    const client = await prisma.client.findUnique({
      where: {id, tenant_id: auth.tenant_id},
      include: {
        sales: {
          take: 10,
          orderBy: {creation_date: "desc"},
          select: {id: true},
        },
      },
    });
    if (!client) return error("api.errors.notFound", 404, {id});

    if (client.sales.length > 0) {
      const total = await prisma.sale.count({where: {client_id: id, tenant_id: auth.tenant_id}});
      const sales = client.sales.map((s) => s.id.split("-").pop()!);
      return error("clients.errors.inUseBySales", 400, {id, name: client.name}, {sales, total});
    }

    if (client.image) {
      const key = extractR2KeyFromUrl(client.image);
      if (key) {
        const deleted = await deleteFromR2(key, auth.tenant_id);
        if (!deleted) return error("api.errors.deleteFailed", 400, {fileUrl: client.image});
      }
    }

    await prisma.client.delete({where: {id}});

    return success("delete", client);
  });
}
