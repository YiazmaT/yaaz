import {LogModule} from "@/src/lib/logger";
import {prisma} from "@/src/lib/prisma";
import {withAuth} from "@/src/lib/route-handler";
import {startOfMonth, endOfMonth, getDaysInMonth, getDate} from "date-fns";
import {toZonedTime, fromZonedTime} from "date-fns-tz";

const ROUTE = "/api/dashboard/sales/monthly";

export async function GET() {
  return withAuth(LogModule.DASHBOARD, ROUTE, async ({auth, success}) => {
    const timezone = auth.tenant.time_zone;

    const now = new Date();
    const zonedNow = toZonedTime(now, timezone);

    const zonedStart = startOfMonth(zonedNow);
    const zonedEnd = endOfMonth(zonedNow);

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
        total: true,
        approximate_cost: true,
        creation_date: true,
      },
    });

    const daysInMonth = getDaysInMonth(zonedNow);
    const dailyTotals: {day: number; total: number}[] = [];

    for (let i = 1; i <= daysInMonth; i++) {
      dailyTotals.push({day: i, total: 0});
    }

    let monthTotal = 0;
    let monthCost = 0;

    for (const sale of sales) {
      if (sale.creation_date) {
        const zonedSaleDate = toZonedTime(sale.creation_date, timezone);
        const dayOfMonth = getDate(zonedSaleDate);

        const saleTotal = Number(sale.total);
        dailyTotals[dayOfMonth - 1].total += saleTotal;
        monthTotal += saleTotal;
        monthCost += Number(sale.approximate_cost);
      }
    }

    const averageTicket = sales.length > 0 ? monthTotal / sales.length : 0;

    return success("get", {
      days: dailyTotals,
      count: sales.length,
      averageTicket,
      approximateCost: monthCost,
      approximateProfit: monthTotal - monthCost,
      period: {
        start: zonedStart.toISOString(),
        end: zonedEnd.toISOString(),
      },
    });
  });
}
