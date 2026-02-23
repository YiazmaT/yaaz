import {BillStatus} from "@prisma/client";
import {LogModule} from "@/src/lib/logger";
import {prisma} from "@/src/lib/prisma";
import {withAuth} from "@/src/lib/route-handler";
import {NextRequest} from "next/server";

const ROUTE = "/api/finance/bill/delete";

export async function DELETE(req: NextRequest) {
  return withAuth(LogModule.BILL, ROUTE, async ({auth, success, error}) => {
    const {id} = await req.json();

    if (!id) return error("api.errors.missingRequiredFields", 400);

    const existing = await prisma.bill.findUnique({where: {id, tenant_id: auth.tenant_id}});
    if (!existing) return error("api.errors.notFound", 404, {id});
    if (existing.status === BillStatus.paid) return error("finance.bills.errors.cannotDeletePaidBill", 400);

    await prisma.bill.delete({where: {id, tenant_id: auth.tenant_id}});

    return success("delete", existing);
  });
}
