import {authenticateRequest} from "@/src/lib/auth";
import {logCritical, logGet, LogModule, LogSource} from "@/src/lib/logger";
import {prisma} from "@/src/lib/prisma";
import {NextRequest, NextResponse} from "next/server";
import {startOfDay, endOfDay} from "date-fns";
import {toZonedTime, fromZonedTime} from "date-fns-tz";

const ROUTE = "/api/dashboard/sales/today";

export async function GET(request: NextRequest) {
  const auth = await authenticateRequest(LogModule.DASHBOARD, ROUTE);
  if (auth.error) return auth.error;

  try {
    const {searchParams} = new URL(request.url);
    const timezone = searchParams.get("timezone") || "UTC";

    const now = new Date();

    const zonedDate = toZonedTime(now, timezone);

    const startOfZonedDay = startOfDay(zonedDate);
    const endOfZonedDay = endOfDay(zonedDate);

    const utcStart = fromZonedTime(startOfZonedDay, timezone);
    const utcEnd = fromZonedTime(endOfZonedDay, timezone);

    const result = await prisma.sale.aggregate({
      _sum: {
        total: true,
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
    const count = result._count.id;
    const averageTicket = count > 0 ? total / count : 0;

    const returnPayload = {
      total,
      count,
      averageTicket,
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
