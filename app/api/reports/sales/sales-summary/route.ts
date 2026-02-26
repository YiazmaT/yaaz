import {LogModule} from "@/src/lib/logger";
import {prisma} from "@/src/lib/prisma";
import {withAuth} from "@/src/lib/route-handler";
import {NextRequest} from "next/server";
import {startOfDay, endOfDay, parseISO, eachDayOfInterval} from "date-fns";
import {fromZonedTime} from "date-fns-tz";
import Decimal from "decimal.js";

const ROUTE = "/api/reports/sales/sales-summary";

export async function GET(req: NextRequest) {
  return withAuth(LogModule.REPORTS, ROUTE, async ({auth, success, error}) => {
    const {searchParams} = new URL(req.url);
    const dateFrom = searchParams.get("dateFrom") || "";
    const dateTo = searchParams.get("dateTo") || "";
    const timezone = auth.tenant.time_zone;

    if (!dateFrom || !dateTo) return error("api.errors.missingRequiredFields", 400);

    const zonedStart = startOfDay(parseISO(dateFrom));
    const zonedEnd = endOfDay(parseISO(dateTo));
    const utcStart = fromZonedTime(zonedStart, timezone);
    const utcEnd = fromZonedTime(zonedEnd, timezone);

    const sales = await prisma.sale.findMany({
      where: {
        tenant_id: auth.tenant_id,
        is_quote: false,
        creation_date: {
          gte: utcStart,
          lte: utcEnd,
        },
      },
      select: {
        id: true,
        total: true,
        payment_method: {select: {name: true}},
        creation_date: true,
      },
      orderBy: {creation_date: "asc"},
    });

    const paymentMethods = [...new Set(sales.map((s) => s.payment_method.name))];

    const days = eachDayOfInterval({start: parseISO(dateFrom), end: parseISO(dateTo)});

    const rows = days.map((day) => {
      const dayStart = fromZonedTime(startOfDay(day), timezone);
      const dayEnd = fromZonedTime(endOfDay(day), timezone);

      const daySales = sales.filter((sale) => {
        const saleDate = new Date(sale.creation_date);
        return saleDate >= dayStart && saleDate <= dayEnd;
      });

      const totalSales = daySales.reduce((acc, sale) => acc.plus(new Decimal(sale.total.toString())), new Decimal(0));
      const transactionCount = daySales.length;
      const averageTicket = transactionCount > 0 ? totalSales.div(transactionCount) : new Decimal(0);

      const byPaymentMethod: Record<string, Decimal> = Object.fromEntries(paymentMethods.map((pm) => [pm, new Decimal(0)]));

      daySales.forEach((sale) => {
        const name = sale.payment_method.name;
        byPaymentMethod[name] = byPaymentMethod[name].plus(new Decimal(sale.total.toString()));
      });

      return {
        date: day.toISOString(),
        totalSales: totalSales.toFixed(2),
        transactionCount,
        averageTicket: averageTicket.toFixed(2),
        byPaymentMethod: Object.fromEntries(Object.entries(byPaymentMethod).map(([key, val]) => [key, val.toFixed(2)])),
      };
    });

    return success("get", {paymentMethods, rows});
  });
}
