import {authenticateRequest} from "@/src/lib/auth";
import {logCritical, logGet, LogModule, LogSource} from "@/src/lib/logger";
import {prisma} from "@/src/lib/prisma";
import {NextRequest, NextResponse} from "next/server";
import {startOfDay, endOfDay, parseISO, eachDayOfInterval} from "date-fns";
import {fromZonedTime} from "date-fns-tz";
import Decimal from "decimal.js";

const ROUTE = "/api/reports/sales/sales-summary";

export async function GET(req: NextRequest) {
  const auth = await authenticateRequest(LogModule.REPORTS, ROUTE);
  if (auth.error) return auth.error;

  try {
    const {searchParams} = new URL(req.url);
    const dateFrom = searchParams.get("dateFrom") || "";
    const dateTo = searchParams.get("dateTo") || "";
    const timezone = searchParams.get("timezone") || "America/Sao_Paulo";

    if (!dateFrom || !dateTo) {
      return NextResponse.json({error: "api.errors.missingRequiredFields"}, {status: 400});
    }

    const zonedStart = startOfDay(parseISO(dateFrom));
    const zonedEnd = endOfDay(parseISO(dateTo));
    const utcStart = fromZonedTime(zonedStart, timezone);
    const utcEnd = fromZonedTime(zonedEnd, timezone);

    const sales = await prisma.sale.findMany({
      where: {
        tenant_id: auth.tenant_id,
        creation_date: {
          gte: utcStart,
          lte: utcEnd,
        },
      },
      select: {
        id: true,
        total: true,
        payment_method: true,
        creation_date: true,
      },
      orderBy: {creation_date: "asc"},
    });

    const days = eachDayOfInterval({start: parseISO(dateFrom), end: parseISO(dateTo)});

    const result = days.map((day) => {
      const dayStart = fromZonedTime(startOfDay(day), timezone);
      const dayEnd = fromZonedTime(endOfDay(day), timezone);

      const daySales = sales.filter((sale) => {
        const saleDate = new Date(sale.creation_date);
        return saleDate >= dayStart && saleDate <= dayEnd;
      });

      const totalSales = daySales.reduce((acc, sale) => acc.plus(new Decimal(sale.total.toString())), new Decimal(0));
      const transactionCount = daySales.length;
      const averageTicket = transactionCount > 0 ? totalSales.div(transactionCount) : new Decimal(0);

      const byPaymentMethod = {
        cash: new Decimal(0),
        credit: new Decimal(0),
        debit: new Decimal(0),
        pix: new Decimal(0),
        iFood: new Decimal(0),
      };

      daySales.forEach((sale) => {
        const method = sale.payment_method as keyof typeof byPaymentMethod;
        if (byPaymentMethod[method] !== undefined) {
          byPaymentMethod[method] = byPaymentMethod[method].plus(new Decimal(sale.total.toString()));
        }
      });

      return {
        date: day.toISOString(),
        totalSales: totalSales.toFixed(2),
        transactionCount,
        averageTicket: averageTicket.toFixed(2),
        cash: byPaymentMethod.cash.toFixed(2),
        credit: byPaymentMethod.credit.toFixed(2),
        debit: byPaymentMethod.debit.toFixed(2),
        pix: byPaymentMethod.pix.toFixed(2),
        iFood: byPaymentMethod.iFood.toFixed(2),
      };
    });

    logGet({module: LogModule.REPORTS, source: LogSource.API, userId: auth.user!.id, tenantId: auth.tenant_id, content: result, route: ROUTE});

    return NextResponse.json(result, {status: 200});
  } catch (error) {
    await logCritical({module: LogModule.REPORTS, source: LogSource.API, error, route: ROUTE, userId: auth.user!.id, tenantId: auth.tenant_id});
    return NextResponse.json({error: "api.errors.somethingWentWrong"}, {status: 500});
  }
}
