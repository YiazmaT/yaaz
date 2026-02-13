import {LogModule} from "@/src/lib/logger";
import {prisma} from "@/src/lib/prisma";
import {withAuth} from "@/src/lib/route-handler";
import {startOfDay, endOfDay} from "date-fns";
import {toZonedTime, fromZonedTime} from "date-fns-tz";

const ROUTE = "/api/dashboard/sales/today";

export async function GET() {
  return withAuth(LogModule.DASHBOARD, ROUTE, async ({auth, success}) => {
    const timezone = auth.tenant.time_zone;

    const now = new Date();
    const zonedDate = toZonedTime(now, timezone);

    const startOfZonedDay = startOfDay(zonedDate);
    const endOfZonedDay = endOfDay(zonedDate);

    const utcStart = fromZonedTime(startOfZonedDay, timezone);
    const utcEnd = fromZonedTime(endOfZonedDay, timezone);

    const result = await prisma.sale.aggregate({
      _sum: {
        total: true,
        approximate_cost: true,
      },
      _count: {
        id: true,
      },
      where: {
        tenant_id: auth.tenant_id,
        is_quote: false,
        creation_date: {
          gte: utcStart,
          lte: utcEnd,
        },
      },
    });

    const total = Number(result._sum.total || 0);
    const approximateCost = Number(result._sum.approximate_cost || 0);
    const count = result._count.id;
    const averageTicket = count > 0 ? total / count : 0;

    return success("get", {
      total,
      count,
      averageTicket,
      approximateCost,
      approximateProfit: total - approximateCost,
      period: {
        start: utcStart.toISOString(),
        end: utcEnd.toISOString(),
      },
    });
  });
}
