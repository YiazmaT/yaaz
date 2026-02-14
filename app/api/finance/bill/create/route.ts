import Decimal from "decimal.js";
import {LogModule} from "@/src/lib/logger";
import {prisma} from "@/src/lib/prisma";
import {withAuth} from "@/src/lib/route-handler";
import {NextRequest} from "next/server";

const ROUTE = "/api/finance/bill/create";

export async function POST(req: NextRequest) {
  return withAuth(LogModule.FINANCE, ROUTE, async ({auth, success, error}) => {
    const {description, categoryId, totalAmount, recurrenceType, recurrenceInterval, recurrenceCount, dueDate} = await req.json();

    if (!description || !totalAmount || !recurrenceType || !dueDate) {
      return error("api.errors.missingRequiredFields", 400);
    }

    if (recurrenceType === "installment" && (!recurrenceCount || recurrenceCount < 1)) {
      return error("api.errors.missingRequiredFields", 400);
    }

    if (recurrenceType === "recurring" && (!recurrenceInterval || !recurrenceCount || recurrenceCount < 1)) {
      return error("api.errors.missingRequiredFields", 400);
    }

    const maxCode = await prisma.bill.aggregate({where: {tenant_id: auth.tenant_id}, _max: {code: true}});
    const nextCode = (maxCode._max.code || 0) + 1;

    const bill = await prisma.bill.create({
      data: {
        tenant_id: auth.tenant_id,
        code: nextCode,
        description,
        category_id: categoryId || null,
        total_amount: totalAmount,
        recurrence_type: recurrenceType,
        recurrence_interval: recurrenceType === "recurring" ? recurrenceInterval : null,
        recurrence_count: recurrenceType !== "none" ? recurrenceCount : null,
        creator_id: auth.user.id,
      },
    });

    const installments: any[] = [];
    const firstDueDate = new Date(dueDate);

    if (recurrenceType === "none") {
      installments.push({
        tenant_id: auth.tenant_id,
        bill_id: bill.id,
        installment_number: 1,
        amount: totalAmount,
        due_date: firstDueDate,
        creator_id: auth.user.id,
      });
    } else if (recurrenceType === "installment") {
      const installmentAmount = new Decimal(totalAmount).div(recurrenceCount).toDecimalPlaces(2);
      const remainder = new Decimal(totalAmount).minus(installmentAmount.times(recurrenceCount));

      for (let i = 0; i < recurrenceCount; i++) {
        const dueD = i === 0 ? firstDueDate : addInterval(firstDueDate, "monthly");
        if (i > 0) {
          const d = new Date(firstDueDate);
          d.setMonth(d.getMonth() + i);
          dueD.setTime(d.getTime());
        }

        let amount = installmentAmount;
        if (i === 0) amount = installmentAmount.plus(remainder);

        installments.push({
          tenant_id: auth.tenant_id,
          bill_id: bill.id,
          installment_number: i + 1,
          amount: amount.toString(),
          due_date:
            i === 0
              ? firstDueDate
              : (() => {
                  const d = new Date(firstDueDate);
                  d.setMonth(d.getMonth() + i);
                  return d;
                })(),
          creator_id: auth.user.id,
        });
      }
    } else if (recurrenceType === "recurring") {
      for (let i = 0; i < recurrenceCount; i++) {
        let dueD = firstDueDate;
        if (i > 0) {
          dueD = new Date(firstDueDate);
          for (let j = 0; j < i; j++) {
            dueD = addInterval(dueD, recurrenceInterval);
          }
        }

        installments.push({
          tenant_id: auth.tenant_id,
          bill_id: bill.id,
          installment_number: i + 1,
          amount: totalAmount,
          due_date: dueD,
          creator_id: auth.user.id,
        });
      }
    }

    await prisma.billInstallment.createMany({data: installments});

    const result = await prisma.bill.findUnique({
      where: {id: bill.id, tenant_id: auth.tenant_id},
      include: {installments: {orderBy: {installment_number: "asc"}}},
    });

    return success("create", result);
  });
}

function addInterval(date: Date, interval: string): Date {
  const d = new Date(date);
  switch (interval) {
    case "weekly":
      d.setDate(d.getDate() + 7);
      break;
    case "biweekly":
      d.setDate(d.getDate() + 14);
      break;
    case "monthly":
      d.setMonth(d.getMonth() + 1);
      break;
    case "bimonthly":
      d.setMonth(d.getMonth() + 2);
      break;
    case "quarterly":
      d.setMonth(d.getMonth() + 3);
      break;
    case "semiannual":
      d.setMonth(d.getMonth() + 6);
      break;
    case "annual":
      d.setFullYear(d.getFullYear() + 1);
      break;
  }
  return d;
}
