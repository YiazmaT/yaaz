import {LogModule} from "@/src/lib/logger";
import {prisma} from "@/src/lib/prisma";
import {withAuth} from "@/src/lib/route-handler";
import {NextRequest} from "next/server";

const ROUTE = "/api/settings/user-group/update";

export async function PUT(req: NextRequest) {
  return withAuth(LogModule.USER_GROUP, ROUTE, "admin", async ({auth, success, error}) => {
    const {id, name, description, permissions} = await req.json();

    if (!id || !name) return error("api.errors.missingRequiredFields", 400);

    const existing = await prisma.userGroup.findFirst({where: {id, tenant_id: auth.tenant_id}});
    if (!existing) return error("api.errors.notFound", 404);

    const group = await prisma.$transaction(async (tx) => {
      await tx.userGroupPermission.deleteMany({where: {user_group_id: id, tenant_id: auth.tenant_id}});

      return tx.userGroup.update({
        where: {id, tenant_id: auth.tenant_id},
        data: {
          name,
          description: description || null,
          last_edit_date: new Date(),
          last_editor_id: auth.user.id,
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
          last_edit_date: true,
          permissions: {select: {module: true, action: true}},
        },
      });
    });

    return success("update", group, {before: {name: existing.name, description: existing.description}, after: {name: group.name, description: group.description}});
  });
}
