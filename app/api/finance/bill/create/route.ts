import Decimal from "decimal.js";
import {LogModule} from "@/src/lib/logger";
import {prisma} from "@/src/lib/prisma";
import {withAuth} from "@/src/lib/route-handler";
import {NextRequest} from "next/server";

import {parseDateUTC} from "@/src/utils/parse-date";

const ROUTE = "/api/finance/bill/create";

export async function POST(req: NextRequest) {
  return withAuth(LogModule.BILL, ROUTE, async ({auth, success, error}) => {
    const {description, categoryId, amount, installmentCount, dueDate} = await req.json();

    if (!description || !amount || !dueDate) {
      return error("api.errors.missingRequiredFields", 400);
    }

    const count = installmentCount ? parseInt(installmentCount) : 1;
    if (count < 1) return error("finance.bills.errors.countMinOne", 400);

    const maxCode = await prisma.bill.aggregate({where: {tenant_id: auth.tenant_id}, _max: {code: true}});
    const nextCode = (maxCode._max.code || 0) + 1;

    const totalAmount = new Decimal(amount);
    const installmentAmount = totalAmount.div(count).toDecimalPlaces(2);
    const remainder = totalAmount.minus(installmentAmount.times(count));
    const firstDueDate = parseDateUTC(dueDate);

    const bills = [];
    for (let i = 0; i < count; i++) {
      let billAmount = installmentAmount;
      if (i === 0) billAmount = installmentAmount.plus(remainder);

      const billDueDate = new Date(firstDueDate);
      if (i > 0) billDueDate.setMonth(billDueDate.getMonth() + i);

      bills.push({
        tenant_id: auth.tenant_id,
        code: nextCode,
        description,
        category_id: categoryId || null,
        amount: billAmount.toString(),
        due_date: billDueDate,
        installment_number: i + 1,
        installment_count: count,
        creator_id: auth.user.id,
      });
    }

    const result = await prisma.$transaction(bills.map((b) => prisma.bill.create({data: b})));

    return success("create", result);
  });
}
