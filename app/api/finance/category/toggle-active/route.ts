import {LogModule} from "@/src/lib/logger";
import {prisma} from "@/src/lib/prisma";
import {withAuth} from "@/src/lib/route-handler";
import {NextRequest} from "next/server";

const ROUTE = "/api/finance/category/toggle-active";

export async function PUT(req: NextRequest) {
  return withAuth(LogModule.FINANCE, ROUTE, async ({auth, success, error}) => {
    const {id} = await req.json();

    if (!id) return error("api.errors.missingRequiredFields", 400);

    const existing = await prisma.financeCategory.findUnique({where: {id, tenant_id: auth.tenant_id}});
    if (!existing) return error("api.errors.notFound", 404, {id});

    const category = await prisma.financeCategory.update({
      where: {id, tenant_id: auth.tenant_id},
      data: {
        active: !existing.active,
        last_edit_date: new Date(),
        last_editor_id: auth.user.id,
      },
    });

    return success("update", category, {before: existing, after: category});
  });
}
