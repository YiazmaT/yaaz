import {LogModule} from "@/src/lib/logger";
import {prisma} from "@/src/lib/prisma";
import {withAuth} from "@/src/lib/route-handler";
import {DeleteBankAccountDto} from "@/src/pages-content/finance/bank-accounts/dto";
import {NextRequest} from "next/server";

const ROUTE = "/api/finance/bank-account/delete";

export async function DELETE(req: NextRequest) {
  return withAuth(LogModule.BANK_ACCOUNT, ROUTE, async ({auth, success, error}) => {
    const {id}: DeleteBankAccountDto = await req.json();

    if (!id) return error("api.errors.missingRequiredFields", 400);

    const account = await prisma.bankAccount.findUnique({where: {id, tenant_id: auth.tenant_id}});
    if (!account) return error("api.errors.notFound", 404, {id});

    const transactionCount = await prisma.bankTransaction.count({where: {bank_account_id: id, tenant_id: auth.tenant_id}});

    if (transactionCount > 0) {
      return error("finance.bank.errors.inUse", 400, {id, transactionCount}, {transactionCount});
    }

    await prisma.bankAccount.delete({where: {id}});

    return success("delete", account);
  });
}
