import {LogModule} from "@/src/lib/logger";
import {prisma} from "@/src/lib/prisma";
import {withAuth} from "@/src/lib/route-handler";
import {NextRequest} from "next/server";

const ROUTE = "/api/finance/bank-account/statement";

export async function GET(req: NextRequest) {
  return withAuth(LogModule.BANK_ACCOUNT, ROUTE, async ({auth, success, error}) => {
    const {searchParams} = new URL(req.url);
    const bankAccountId = searchParams.get("bankAccountId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    if (!bankAccountId) return error("api.errors.missingRequiredFields", 400);

    const account = await prisma.bankAccount.findUnique({where: {id: bankAccountId, tenant_id: auth.tenant_id}});
    if (!account) return error("api.errors.notFound", 404, {bankAccountId});

    const where = {tenant_id: auth.tenant_id, bank_account_id: bankAccountId};

    const [data, total] = await Promise.all([
      prisma.bankTransaction.findMany({
        where,
        skip,
        take: limit,
        orderBy: {date: "desc"},
        select: {
          id: true,
          type: true,
          amount: true,
          description: true,
          date: true,
          bill_id: true,
          category: {select: {id: true, name: true}},
          bill: {select: {code: true, description: true, installment_number: true, installment_count: true}},
        },
      }),
      prisma.bankTransaction.count({where}),
    ]);

    return success("get", {data, total, page, limit, account: {id: account.id, name: account.name, balance: account.balance}});
  });
}
