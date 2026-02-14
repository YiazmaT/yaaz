import {BillStatus} from "@prisma/client";
import {LogModule} from "@/src/lib/logger";
import {prisma} from "@/src/lib/prisma";
import {withAuth} from "@/src/lib/route-handler";
import {NextRequest} from "next/server";

const ROUTE = "/api/finance/bill/delete";

export async function DELETE(req: NextRequest) {
  return withAuth(LogModule.FINANCE, ROUTE, async ({auth, success, error}) => {
    const {id} = await req.json();

    if (!id) return error("api.errors.missingRequiredFields", 400);

    const existing = await prisma.bill.findUnique({
      where: {id, tenant_id: auth.tenant_id},
      include: {installments: true},
    });
    if (!existing) return error("api.errors.notFound", 404, {id});

    const hasPaid = existing.installments.some((i) => i.status === BillStatus.paid);
    if (hasPaid) return error("finance.bills.errors.cannotDeleteWithPaidInstallments", 400);

    await prisma.bill.delete({where: {id, tenant_id: auth.tenant_id}});

    return success("delete", {id});
  });
}
