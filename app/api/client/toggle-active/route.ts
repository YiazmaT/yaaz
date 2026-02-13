import {LogModule} from "@/src/lib/logger";
import {prisma} from "@/src/lib/prisma";
import {withAuth} from "@/src/lib/route-handler";
import {NextRequest} from "next/server";

const ROUTE = "/api/client/toggle-active";

export async function PUT(req: NextRequest) {
  return withAuth(LogModule.CLIENT, ROUTE, async ({auth, success, error}) => {
    const {id} = await req.json();

    if (!id) return error("api.errors.missingRequiredFields", 400);

    const existingClient = await prisma.client.findUnique({where: {id, tenant_id: auth.tenant_id}});
    if (!existingClient) return error("api.errors.dataNotFound", 404, {id});

    const client = await prisma.client.update({
      where: {id, tenant_id: auth.tenant_id},
      data: {
        active: !existingClient.active,
        last_edit_date: new Date(),
        last_editor_id: auth.user.id,
      },
    });

    return success("update", client, {before: existingClient, after: client});
  });
}
