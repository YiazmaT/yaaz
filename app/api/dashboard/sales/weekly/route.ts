import {LogModule} from "@/src/lib/logger";
import {prisma} from "@/src/lib/prisma";
import {withAuth} from "@/src/lib/route-handler";
import {NextRequest} from "next/server";
import {startOfWeek, endOfWeek, getDay} from "date-fns";
import {toZonedTime, fromZonedTime} from "date-fns-tz";

const ROUTE = "/api/dashboard/sales/weekly";

export async function GET(request: NextRequest) {
  return withAuth(LogModule.DASHBOARD, ROUTE, async ({auth, success}) => {
    const {searchParams} = new URL(request.url);
    const timezone = searchParams.get("timezone") || "UTC";

    const now = new Date();
    const zonedNow = toZonedTime(now, timezone);

    const zonedStart = startOfWeek(zonedNow, {weekStartsOn: 0});
    const zonedEnd = endOfWeek(zonedNow, {weekStartsOn: 0});

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

    const dailyTotals: number[] = [0, 0, 0, 0, 0, 0, 0];
    let weekTotal = 0;
    let weekCost = 0;

    for (const sale of sales) {
      if (sale.creation_date) {
        const saleZonedDate = toZonedTime(sale.creation_date, timezone);
        const saleDay = getDay(saleZonedDate);

        const saleTotal = Number(sale.total);
        dailyTotals[saleDay] += saleTotal;
        weekTotal += saleTotal;
        weekCost += Number(sale.approximate_cost);
      }
    }

    const averageTicket = sales.length > 0 ? weekTotal / sales.length : 0;

    return success("get", {
      days: dailyTotals,
      count: sales.length,
      averageTicket,
      approximateCost: weekCost,
      approximateProfit: weekTotal - weekCost,
      period: {
        start: utcStart.toISOString(),
        end: utcEnd.toISOString(),
      },
    });
  });
}
