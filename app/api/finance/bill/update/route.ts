import {BillStatus} from "@prisma/client";
import {LogModule} from "@/src/lib/logger";
import {prisma} from "@/src/lib/prisma";
import {withAuth} from "@/src/lib/route-handler";
import {NextRequest} from "next/server";

const ROUTE = "/api/finance/bill/update";

export async function PUT(req: NextRequest) {
  return withAuth(LogModule.FINANCE, ROUTE, async ({auth, success, error}) => {
    const {id, installmentId, description, categoryId, amount, dueDate} = await req.json();

    if (!id || !description) return error("api.errors.missingRequiredFields", 400);

    const existing = await prisma.bill.findUnique({
      where: {id, tenant_id: auth.tenant_id},
      include: {installments: true},
    });
    if (!existing) return error("api.errors.notFound", 404, {id});

    if (installmentId) {
      const installment = existing.installments.find((i) => i.id === installmentId);
      if (installment?.status === BillStatus.paid) return error("finance.bills.errors.cannotEditPaidInstallment", 400);
    }

    const bill = await prisma.bill.update({
      where: {id, tenant_id: auth.tenant_id},
      data: {
        description,
        category_id: categoryId || null,
        last_edit_date: new Date(),
        last_editor_id: auth.user.id,
      },
    });

    if (installmentId) {
      await prisma.billInstallment.update({
        where: {id: installmentId, tenant_id: auth.tenant_id},
        data: {
          ...(amount !== undefined && {amount: parseFloat(amount)}),
          ...(dueDate && {due_date: new Date(dueDate)}),
          last_edit_date: new Date(),
          last_editor_id: auth.user.id,
        },
      });
    }

    return success("update", bill, {before: existing, after: bill});
  });
}
