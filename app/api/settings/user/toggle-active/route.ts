import {LogModule} from "@/src/lib/logger";
import {prisma} from "@/src/lib/prisma";
import {withAuth} from "@/src/lib/route-handler";
import {NextRequest} from "next/server";

const ROUTE = "/api/settings/user/toggle-active";

export async function PUT(req: NextRequest) {
  return withAuth(LogModule.USER, ROUTE, async ({auth, success, error}) => {
    const {id} = await req.json();

    if (!id) return error("api.errors.missingRequiredFields", 400);

    const user = await prisma.user.findFirst({where: {id, tenant_id: auth.tenant_id}});
    if (!user) return error("api.errors.notFound", 404);

    if (user.owner) return error("users.errors.cannotDeactivateOwner", 400);

    if (!user.active) {
      const tenant = await prisma.tenant.findUnique({where: {id: auth.tenant_id}, select: {max_user_amount: true}});
      const activeCount = await prisma.user.count({where: {tenant_id: auth.tenant_id, active: true}});

      if (activeCount >= (tenant?.max_user_amount ?? 3)) {
        return error("users.errors.userLimitReached", 400);
      }
    }

    const updated = await prisma.user.update({
      where: {id, tenant_id: auth.tenant_id},
      data: {active: !user.active, last_edit_date: new Date(), last_editor_id: auth.user.id},
      select: {id: true, name: true, login: true, admin: true, owner: true, active: true, image: true},
    });

    return success("update", updated, {before: {active: user.active}, after: {active: updated.active}});
  });
}
