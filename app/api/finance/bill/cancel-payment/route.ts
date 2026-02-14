import Decimal from "decimal.js";
import {LogModule} from "@/src/lib/logger";
import {prisma} from "@/src/lib/prisma";
import {withAuth} from "@/src/lib/route-handler";
import {NextRequest} from "next/server";
import {BillStatus} from "@prisma/client";

const ROUTE = "/api/finance/bill/cancel-payment";

export async function POST(req: NextRequest) {
  return withAuth(LogModule.FINANCE, ROUTE, async ({auth, success, error}) => {
    const {installmentId} = await req.json();

    if (!installmentId) return error("api.errors.missingRequiredFields", 400);

    const installment = await prisma.billInstallment.findUnique({
      where: {id: installmentId, tenant_id: auth.tenant_id},
      include: {bank_transaction: true},
    });
    if (!installment) return error("api.errors.notFound", 404, {installmentId});
    if (installment.status !== BillStatus.paid) return error("finance.bills.errors.notPaid", 400);

    const amount = new Decimal(installment.amount.toString());
    const bankAccountId = installment.bank_account_id;

    const operations: any[] = [
      prisma.billInstallment.update({
        where: {id: installmentId, tenant_id: auth.tenant_id},
        data: {
          status: BillStatus.pending,
          paid_date: null,
          bank_account_id: null,
          last_edit_date: new Date(),
          last_editor_id: auth.user.id,
        },
      }),
    ];

    if (installment.bank_transaction) {
      operations.push(prisma.bankTransaction.delete({where: {id: installment.bank_transaction.id, tenant_id: auth.tenant_id}}));
    }

    if (bankAccountId) {
      operations.push(
        prisma.bankAccount.update({
          where: {id: bankAccountId, tenant_id: auth.tenant_id},
          data: {balance: {increment: amount.toNumber()}},
        }),
      );
    }

    await prisma.$transaction(operations);

    return success("update", {installmentId});
  });
}
