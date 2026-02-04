import {authenticateRequest} from "@/src/lib/auth";
import {logCritical, logGet, LogModule, LogSource} from "@/src/lib/logger";
import {prisma} from "@/src/lib/prisma";
import {NextRequest, NextResponse} from "next/server";
import {startOfMonth, endOfMonth, getDaysInMonth, getDate} from "date-fns";
import {toZonedTime, fromZonedTime} from "date-fns-tz";

const ROUTE = "/api/dashboard/sales/monthly";

export async function GET(request: NextRequest) {
  const auth = await authenticateRequest(LogModule.DASHBOARD, ROUTE);
  if (auth.error) return auth.error;

  try {
    const {searchParams} = new URL(request.url);
    const timezone = searchParams.get("timezone") || "UTC";

    const now = new Date();
    const zonedNow = toZonedTime(now, timezone);

    const zonedStart = startOfMonth(zonedNow);
    const zonedEnd = endOfMonth(zonedNow);

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
        total: true,
        creation_date: true,
      },
    });

    const daysInMonth = getDaysInMonth(zonedNow);
    const dailyTotals: {day: number; total: number}[] = [];

    for (let i = 1; i <= daysInMonth; i++) {
      dailyTotals.push({day: i, total: 0});
    }

    let monthTotal = 0;

    for (const sale of sales) {
      if (sale.creation_date) {
        const zonedSaleDate = toZonedTime(sale.creation_date, timezone);
        const dayOfMonth = getDate(zonedSaleDate);

        const saleTotal = Number(sale.total);
        dailyTotals[dayOfMonth - 1].total += saleTotal;
        monthTotal += saleTotal;
      }
    }

    const averageTicket = sales.length > 0 ? monthTotal / sales.length : 0;

    const returnPayload = {
      days: dailyTotals,
      count: sales.length,
      averageTicket,
      period: {
        start: zonedStart.toISOString(),
        end: zonedEnd.toISOString(),
      },
    };

    logGet({module: LogModule.DASHBOARD, source: LogSource.API, route: ROUTE, content: returnPayload, userId: auth.user!.id, tenantId: auth.tenant_id});

    return NextResponse.json(returnPayload);
  } catch (error) {
    await logCritical({module: LogModule.DASHBOARD, source: LogSource.API, route: ROUTE, error, userId: auth.user!.id, tenantId: auth.tenant_id});
    return NextResponse.json({error: "api.errors.somethingWentWrong"}, {status: 500});
  }
}
