import {authenticateRequest} from "@/src/lib/auth";
import {logCritical, logGet, LogModule, LogSource} from "@/src/lib/logger";
import {prisma} from "@/src/lib/prisma";
import {NextRequest, NextResponse} from "next/server";
import {startOfWeek, endOfWeek, getDay} from "date-fns";
import {toZonedTime, fromZonedTime} from "date-fns-tz";

const ROUTE = "/api/dashboard/sales/weekly";

export async function GET(request: NextRequest) {
  const auth = await authenticateRequest(LogModule.DASHBOARD, ROUTE);
  if (auth.error) return auth.error;

  try {
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

    const returnPayload = {
      days: dailyTotals,
      count: sales.length,
      averageTicket,
      approximateCost: weekCost,
      approximateProfit: weekTotal - weekCost,
      period: {
        start: utcStart.toISOString(),
        end: utcEnd.toISOString(),
      },
    };

    logGet({module: LogModule.DASHBOARD, source: LogSource.API, route: ROUTE, content: returnPayload, userId: auth.user!.id, tenantId: auth.tenant_id});

    return NextResponse.json(returnPayload);
  } catch (error) {
    await logCritical({module: LogModule.DASHBOARD, source: LogSource.API, route: ROUTE, error, userId: auth.user!.id, tenantId: auth.tenant_id});
    return NextResponse.json({error: "api.errors.somethingWentWrong"}, {status: 500});
  }
}
