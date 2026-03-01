import {LogModule} from "@/src/lib/logger";
import {prisma} from "@/src/lib/prisma";
import {withAuth} from "@/src/lib/route-handler";
import {NextRequest} from "next/server";

const ROUTE = "/api/settings/user-group/create";

export async function POST(req: NextRequest) {
  return withAuth(LogModule.USER_GROUP, ROUTE, async ({auth, success, error}) => {
    const {name, description, permissions} = await req.json();

    if (!name) return error("api.errors.missingRequiredFields", 400);

    const group = await prisma.userGroup.create({
      data: {
        tenant_id: auth.tenant_id,
        name,
        description: description || null,
        creator_id: auth.user.id,
        permissions: {
          create: (permissions ?? []).map((p: {module: string; action: string}) => ({
            tenant_id: auth.tenant_id,
            module: p.module,
            action: p.action,
          })),
        },
      },
      select: {
        id: true,
        name: true,
        description: true,
        active: true,
        creation_date: true,
        permissions: {select: {module: true, action: true}},
      },
    });

    return success("create", group);
  });
}
