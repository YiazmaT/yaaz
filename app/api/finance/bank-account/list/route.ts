import {LogModule} from "@/src/lib/logger";
import {prisma} from "@/src/lib/prisma";
import {withAuth} from "@/src/lib/route-handler";

const ROUTE = "/api/finance/bank-account/list";
const KEY = "finance.banks";
const ACTION = "read";

export async function GET() {
  return withAuth(LogModule.BANK_ACCOUNT, ROUTE, {key: KEY, action: ACTION}, async ({auth, success}) => {
    const data = await prisma.bankAccount.findMany({
      where: {tenant_id: auth.tenant_id, active: true},
      orderBy: {name: "asc"},
      select: {id: true, name: true, balance: true},
    });

    return success("get", data);
  });
}
