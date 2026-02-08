import {authenticateRequest} from "@/src/lib/auth";
import {logCritical, logGet, LogModule, LogSource} from "@/src/lib/logger";
import {prisma} from "@/src/lib/prisma";
import {ptBR} from "date-fns/locale";
import {NextResponse, NextRequest} from "next/server";
import {subMonths, startOfMonth, endOfMonth, getMonth, getYear, format} from "date-fns";
import {toZonedTime, fromZonedTime} from "date-fns-tz";

const ROUTE = "/api/dashboard/sales/semestral";

export async function GET(request: NextRequest) {
  const auth = await authenticateRequest(LogModule.DASHBOARD, ROUTE);
  if (auth.error) return auth.error;

  try {
    const {searchParams} = new URL(request.url);
    const timezone = searchParams.get("timezone") || "UTC";

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

    const returnPayload = {
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
    };

    logGet({module: LogModule.DASHBOARD, source: LogSource.API, route: ROUTE, content: returnPayload, userId: auth.user!.id, tenantId: auth.tenant_id});

    return NextResponse.json(returnPayload);
  } catch (error) {
    await logCritical({module: LogModule.DASHBOARD, source: LogSource.API, route: ROUTE, error, userId: auth.user!.id, tenantId: auth.tenant_id});
    return NextResponse.json({error: "api.errors.somethingWentWrong"}, {status: 500});
  }
}
