import {BillStatus} from "@prisma/client";
import Decimal from "decimal.js";
import {LogModule} from "@/src/lib/logger";
import {prisma} from "@/src/lib/prisma";
import {withAuth} from "@/src/lib/route-handler";
import {NextRequest} from "next/server";

const ROUTE = "/api/finance/bill/pay";

export async function POST(req: NextRequest) {
  return withAuth(LogModule.FINANCE, ROUTE, async ({auth, success, error}) => {
    const {installmentId, bankAccountId, paidDate} = await req.json();

    if (!installmentId || !bankAccountId || !paidDate) return error("api.errors.missingRequiredFields", 400);

    const installment = await prisma.billInstallment.findUnique({
      where: {id: installmentId, tenant_id: auth.tenant_id},
      include: {bill: true},
    });
    if (!installment) return error("api.errors.notFound", 404);
    if (installment.status === BillStatus.paid) return error("finance.bills.errors.alreadyPaid", 400);

    const account = await prisma.bankAccount.findUnique({where: {id: bankAccountId, tenant_id: auth.tenant_id}});
    if (!account) return error("api.errors.notFound", 404);

    const amount = new Decimal(installment.amount.toString());

    await prisma.$transaction([
      prisma.billInstallment.update({
        where: {id: installmentId, tenant_id: auth.tenant_id},
        data: {
          status: BillStatus.paid,
          paid_date: new Date(paidDate),
          bank_account_id: bankAccountId,
          last_edit_date: new Date(),
          last_editor_id: auth.user.id,
        },
      }),
      prisma.bankTransaction.create({
        data: {
          tenant_id: auth.tenant_id,
          bank_account_id: bankAccountId,
          type: "bill_payment",
          amount: installment.amount,
          description: `${installment.bill.description} #${installment.bill.code}`,
          date: new Date(paidDate),
          category_id: installment.bill.category_id,
          bill_installment_id: installmentId,
          creator_id: auth.user.id,
        },
      }),
      prisma.bankAccount.update({
        where: {id: bankAccountId, tenant_id: auth.tenant_id},
        data: {balance: {decrement: amount.toNumber()}},
      }),
    ]);

    return success("update", {installmentId, bankAccountId});
  });
}
