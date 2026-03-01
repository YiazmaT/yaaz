import {LogModule} from "@/src/lib/logger";
import {prisma} from "@/src/lib/prisma";
import {withAuth} from "@/src/lib/route-handler";
import {NextRequest} from "next/server";

const ROUTE = "/api/settings/user-group/delete";

export async function DELETE(req: NextRequest) {
  return withAuth(LogModule.USER_GROUP, ROUTE, async ({auth, success, error}) => {
    const {id} = await req.json();

    if (!id) return error("api.errors.missingRequiredFields", 400);

    const existing = await prisma.userGroup.findFirst({
      where: {id, tenant_id: auth.tenant_id},
      include: {_count: {select: {users: true}}},
    });

    if (!existing) return error("api.errors.notFound", 404);

    const group = await prisma.userGroup.delete({
      where: {id, tenant_id: auth.tenant_id},
      select: {id: true, name: true},
    });

    return success("delete", group);
  });
}
