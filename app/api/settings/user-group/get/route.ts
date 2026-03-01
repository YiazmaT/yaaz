import {LogModule} from "@/src/lib/logger";
import {prisma} from "@/src/lib/prisma";
import {withAuth} from "@/src/lib/route-handler";
import {NextRequest} from "next/server";

const ROUTE = "/api/settings/user-group/get";

export async function GET(req: NextRequest) {
  return withAuth(LogModule.USER_GROUP, ROUTE, async ({auth, success, error}) => {
    const {searchParams} = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) return error("api.errors.missingRequiredFields", 400);

    const group = await prisma.userGroup.findFirst({
      where: {id, tenant_id: auth.tenant_id},
      select: {
        id: true,
        name: true,
        description: true,
        active: true,
        permissions: {
          select: {module: true, action: true},
        },
      },
    });

    if (!group) return error("api.errors.notFound", 404, {id});

    return success("get", group);
  });
}
