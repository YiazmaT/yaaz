import {BillStatus} from "@prisma/client";
import Decimal from "decimal.js";
import {LogModule} from "@/src/lib/logger";
import {prisma} from "@/src/lib/prisma";
import {withAuth} from "@/src/lib/route-handler";
import {NextRequest} from "next/server";

const ROUTE = "/api/finance/bill/pay";

export async function POST(req: NextRequest) {
  return withAuth(LogModule.FINANCE, ROUTE, async ({auth, success, error}) => {
    const {billId, bankAccountId, paidDate} = await req.json();

    if (!billId || !bankAccountId || !paidDate) return error("api.errors.missingRequiredFields", 400);

    const bill = await prisma.bill.findUnique({where: {id: billId, tenant_id: auth.tenant_id}});
    if (!bill) return error("api.errors.notFound", 404);
    if (bill.status === BillStatus.paid) return error("finance.bills.errors.alreadyPaid", 400);

    const account = await prisma.bankAccount.findUnique({where: {id: bankAccountId, tenant_id: auth.tenant_id}});
    if (!account) return error("api.errors.notFound", 404);

    const amount = new Decimal(bill.amount.toString());

    await prisma.$transaction([
      prisma.bill.update({
        where: {id: billId, tenant_id: auth.tenant_id},
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
          amount: bill.amount,
          description: `${bill.description} #${bill.code}`,
          date: new Date(paidDate),
          category_id: bill.category_id,
          bill_id: billId,
          creator_id: auth.user.id,
        },
      }),
      prisma.bankAccount.update({
        where: {id: bankAccountId, tenant_id: auth.tenant_id},
        data: {balance: {decrement: amount.toNumber()}},
      }),
    ]);

    return success("update", {billId, bankAccountId});
  });
}
