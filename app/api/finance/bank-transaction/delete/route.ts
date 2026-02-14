import Decimal from "decimal.js";
import {LogModule} from "@/src/lib/logger";
import {prisma} from "@/src/lib/prisma";
import {withAuth} from "@/src/lib/route-handler";
import {NextRequest} from "next/server";

const ROUTE = "/api/finance/bank-transaction/delete";

export async function DELETE(req: NextRequest) {
  return withAuth(LogModule.FINANCE, ROUTE, async ({auth, success, error}) => {
    const {id} = await req.json();

    if (!id) return error("api.errors.missingRequiredFields", 400);

    const transaction = await prisma.bankTransaction.findUnique({where: {id, tenant_id: auth.tenant_id}});
    if (!transaction) return error("api.errors.notFound", 404, {id});

    if (transaction.bill_installment_id) {
      return error("finance.bank.errors.cannotDeleteBillTransaction", 400);
    }

    const amountDecimal = new Decimal(transaction.amount.toString());
    const balanceRevert = transaction.type === "deposit" ? amountDecimal.negated() : amountDecimal;

    await prisma.$transaction([
      prisma.bankTransaction.delete({where: {id, tenant_id: auth.tenant_id}}),
      prisma.bankAccount.update({
        where: {id: transaction.bank_account_id, tenant_id: auth.tenant_id},
        data: {balance: {increment: balanceRevert.toNumber()}},
      }),
    ]);

    return success("delete", {id});
  });
}
