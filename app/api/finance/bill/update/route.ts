import {BillStatus} from "@prisma/client";
import {LogModule} from "@/src/lib/logger";
import {prisma} from "@/src/lib/prisma";
import {withAuth} from "@/src/lib/route-handler";
import {NextRequest} from "next/server";

import {parseDateUTC} from "@/src/utils/parse-date";

const ROUTE = "/api/finance/bill/update";

export async function PUT(req: NextRequest) {
  return withAuth(LogModule.BILL, ROUTE, async ({auth, success, error}) => {
    const {id, description, categoryId, amount, dueDate} = await req.json();

    if (!id || !description) return error("api.errors.missingRequiredFields", 400);

    const existing = await prisma.bill.findUnique({where: {id, tenant_id: auth.tenant_id}});
    if (!existing) return error("api.errors.notFound", 404, {id});
    if (existing.status === BillStatus.paid) return error("finance.bills.errors.cannotEditPaidInstallment", 400);

    const bill = await prisma.bill.update({
      where: {id, tenant_id: auth.tenant_id},
      data: {
        description,
        category_id: categoryId || null,
        ...(amount !== undefined && {amount: parseFloat(amount)}),
        ...(dueDate && {due_date: parseDateUTC(dueDate)}),
        last_edit_date: new Date(),
        last_editor_id: auth.user.id,
      },
    });

    return success("update", bill, {before: existing, after: bill});
  });
}
