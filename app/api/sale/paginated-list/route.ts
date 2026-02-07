import {authenticateRequest} from "@/src/lib/auth";
import {logCritical, LogModule, LogSource, logGet} from "@/src/lib/logger";
import {prisma} from "@/src/lib/prisma";
import {NextRequest, NextResponse} from "next/server";
import {startOfDay, endOfDay, parseISO} from "date-fns";
import {fromZonedTime} from "date-fns-tz";

const ROUTE = "/api/sale/paginated-list";

export async function GET(req: NextRequest) {
  const auth = await authenticateRequest(LogModule.SALE, ROUTE);
  if (auth.error) return auth.error;

  try {
    const {searchParams} = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const dateFrom = searchParams.get("dateFrom") || "";
    const dateTo = searchParams.get("dateTo") || "";
    const valueFrom = searchParams.get("valueFrom") || "";
    const valueTo = searchParams.get("valueTo") || "";
    const timezone = searchParams.get("timezone") || "America/Sao_Paulo";
    const skip = (page - 1) * limit;

    const where: any = {tenant_id: auth.tenant_id};

    if (search) {
      where.items = {some: {product: {name: {contains: search, mode: "insensitive" as const}}}};
    }

    if (dateFrom || dateTo) {
      where.creation_date = {};
      if (dateFrom) {
        const zonedStart = startOfDay(parseISO(dateFrom));
        const utcStart = fromZonedTime(zonedStart, timezone);
        where.creation_date.gte = utcStart;
      }
      if (dateTo) {
        const zonedEnd = endOfDay(parseISO(dateTo));
        const utcEnd = fromZonedTime(zonedEnd, timezone);
        where.creation_date.lte = utcEnd;
      }
    }

    if (valueFrom || valueTo) {
      where.total = {};
      if (valueFrom) {
        where.total.gte = parseFloat(valueFrom);
      }
      if (valueTo) {
        where.total.lte = parseFloat(valueTo);
      }
    }

    const [data, total] = await Promise.all([
      prisma.sale.findMany({
        where,
        skip,
        take: limit,
        orderBy: {creation_date: "desc"},
        include: {
          items: {
            include: {
              product: true,
            },
          },
          packages: {
            include: {
              package: true,
            },
          },
          client: true,
        },
      }),
      prisma.sale.count({where}),
    ]);

    const response = {data, total, page, limit};

    logGet({module: LogModule.SALE, source: LogSource.API, userId: auth.user!.id, tenantId: auth.tenant_id, content: response, route: ROUTE});

    return NextResponse.json(response, {status: 200});
  } catch (error) {
    await logCritical({module: LogModule.SALE, source: LogSource.API, error, route: ROUTE, userId: auth.user!.id, tenantId: auth.tenant_id});
    return NextResponse.json({error: "api.errors.somethingWentWrong"}, {status: 500});
  }
}
