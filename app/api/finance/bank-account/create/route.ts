import {LogModule} from "@/src/lib/logger";
import {prisma} from "@/src/lib/prisma";
import {withAuth} from "@/src/lib/route-handler";
import {NextRequest} from "next/server";

const ROUTE = "/api/finance/bank-account/create";
const KEY = "finance.banks";
const ACTION = "create";

export async function POST(req: NextRequest) {
  return withAuth(LogModule.BANK_ACCOUNT, ROUTE, {key: KEY, action: ACTION}, async ({auth, success, error}) => {
    const {name, balance} = await req.json();

    if (!name) return error("api.errors.missingRequiredFields", 400);

    const account = await prisma.bankAccount.create({
      data: {
        tenant_id: auth.tenant_id,
        name,
        balance: balance || "0",
        creator_id: auth.user.id,
      },
    });

    return success("create", account);
  });
}
