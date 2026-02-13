import {LogModule} from "@/src/lib/logger";
import {prisma} from "@/src/lib/prisma";
import {withAuth} from "@/src/lib/route-handler";
import {ptBR} from "date-fns/locale";
import {subMonths, startOfMonth, endOfMonth, getMonth, getYear, format} from "date-fns";
import {toZonedTime, fromZonedTime} from "date-fns-tz";

const ROUTE = "/api/dashboard/sales/semestral";

export async function GET() {
  return withAuth(LogModule.DASHBOARD, ROUTE, async ({auth, success}) => {
    const timezone = auth.tenant.time_zone;

    const now = new Date();
    const zonedNow = toZonedTime(now, timezone);

    const months: any[] = [];
    for (let i = 5; i >= 0; i--) {
      const date = subMonths(zonedNow, i);
      const startOfLocalMonth = startOfMonth(date);

      months.push({
        month: getMonth(startOfLocalMonth),
        year: getYear(startOfLocalMonth),
        total: 0,
        label: format(startOfLocalMonth, "MMM", {locale: ptBR}).replace(".", ""),
        localStart: startOfLocalMonth,
      });
    }

    const utcStart = fromZonedTime(months[0].localStart, timezone);
    const utcEnd = fromZonedTime(endOfMonth(zonedNow), timezone);

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

    let totalAmount = 0;
    let totalCost = 0;

    for (const sale of sales) {
      if (sale.creation_date) {
        const zonedSaleDate = toZonedTime(sale.creation_date, timezone);
        const saleMonth = getMonth(zonedSaleDate);
        const saleYear = getYear(zonedSaleDate);

        const saleTotal = Number(sale.total);

        const monthIndex = months.findIndex((m) => m.month === saleMonth && m.year === saleYear);

        if (monthIndex !== -1) {
          months[monthIndex].total += saleTotal;
        }
        totalAmount += saleTotal;
        totalCost += Number(sale.approximate_cost);
      }
    }

    const averageTicket = sales.length > 0 ? totalAmount / sales.length : 0;

    return success("get", {
      months: months.map((m) => ({
        label: m.label,
        total: m.total,
      })),
      count: sales.length,
      averageTicket,
      approximateCost: totalCost,
      approximateProfit: totalAmount - totalCost,
      period: {
        start: utcStart.toISOString(),
        end: utcEnd.toISOString(),
      },
    });
  });
}
