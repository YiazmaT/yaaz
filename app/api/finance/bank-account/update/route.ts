import {LogModule} from "@/src/lib/logger";
import {prisma} from "@/src/lib/prisma";
import {withAuth} from "@/src/lib/route-handler";
import {NextRequest} from "next/server";

const ROUTE = "/api/finance/bank-account/update";

export async function PUT(req: NextRequest) {
  return withAuth(LogModule.BANK_ACCOUNT, ROUTE, async ({auth, success, error}) => {
    const {id, name} = await req.json();

    if (!id || !name) return error("api.errors.missingRequiredFields", 400);

    const existing = await prisma.bankAccount.findUnique({where: {id, tenant_id: auth.tenant_id}});
    if (!existing) return error("api.errors.notFound", 404, {id});

    const account = await prisma.bankAccount.update({
      where: {id, tenant_id: auth.tenant_id},
      data: {
        name,
        last_edit_date: new Date(),
        last_editor_id: auth.user.id,
      },
    });

    return success("update", account, {before: existing, after: account});
  });
}
