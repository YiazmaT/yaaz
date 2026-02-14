import Decimal from "decimal.js";
import {LogModule} from "@/src/lib/logger";
import {prisma} from "@/src/lib/prisma";
import {withAuth} from "@/src/lib/route-handler";
import {NextRequest} from "next/server";

const ROUTE = "/api/finance/bank-transaction/create";

export async function POST(req: NextRequest) {
  return withAuth(LogModule.FINANCE, ROUTE, async ({auth, success, error}) => {
    const {bankAccountId, type, amount, description, date, categoryId} = await req.json();

    if (!bankAccountId || !type || !amount || !date || (type !== "deposit" && type !== "withdrawal"))
      return error("api.errors.missingRequiredFields", 400);

    const account = await prisma.bankAccount.findUnique({where: {id: bankAccountId, tenant_id: auth.tenant_id}});
    if (!account) return error("api.errors.notFound", 404, {bankAccountId});

    const amountDecimal = new Decimal(amount);
    const balanceChange = type === "deposit" ? amountDecimal : amountDecimal.negated();

    const [transaction] = await prisma.$transaction([
      prisma.bankTransaction.create({
        data: {
          tenant_id: auth.tenant_id,
          bank_account_id: bankAccountId,
          type,
          amount,
          description: description || null,
          date: new Date(date),
          category_id: categoryId || null,
          creator_id: auth.user.id,
        },
      }),
      prisma.bankAccount.update({
        where: {id: bankAccountId, tenant_id: auth.tenant_id},
        data: {balance: {increment: balanceChange.toNumber()}},
      }),
    ]);

    return success("create", transaction);
  });
}
