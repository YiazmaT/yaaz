import Decimal from "decimal.js";
import {LogModule} from "@/src/lib/logger";
import {prisma} from "@/src/lib/prisma";
import {withAuth} from "@/src/lib/route-handler";
import {NextRequest} from "next/server";
import {BillStatus} from "@prisma/client";

const ROUTE = "/api/finance/bill/cancel-payment";

export async function POST(req: NextRequest) {
  return withAuth(LogModule.FINANCE, ROUTE, async ({auth, success, error}) => {
    const {billId} = await req.json();

    if (!billId) return error("api.errors.missingRequiredFields", 400);

    const bill = await prisma.bill.findUnique({
      where: {id: billId, tenant_id: auth.tenant_id},
      include: {bank_transaction: true},
    });
    if (!bill) return error("api.errors.notFound", 404, {billId});
    if (bill.status !== BillStatus.paid) return error("finance.bills.errors.notPaid", 400);

    const amount = new Decimal(bill.amount.toString());
    const bankAccountId = bill.bank_account_id;

    const operations: any[] = [
      prisma.bill.update({
        where: {id: billId, tenant_id: auth.tenant_id},
        data: {
          status: BillStatus.pending,
          paid_date: null,
          bank_account_id: null,
          last_edit_date: new Date(),
          last_editor_id: auth.user.id,
        },
      }),
    ];

    if (bill.bank_transaction) {
      operations.push(prisma.bankTransaction.delete({where: {id: bill.bank_transaction.id, tenant_id: auth.tenant_id}}));
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

    return success("update", {billId});
  });
}
