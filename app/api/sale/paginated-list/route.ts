import {LogModule} from "@/src/lib/logger";
import {prisma} from "@/src/lib/prisma";
import {withAuth} from "@/src/lib/route-handler";
import {NextRequest} from "next/server";
import {startOfDay, endOfDay, parseISO} from "date-fns";
import {fromZonedTime} from "date-fns-tz";

const ROUTE = "/api/sale/paginated-list";

export async function GET(req: NextRequest) {
  return withAuth(LogModule.SALE, ROUTE, async ({auth, success}) => {
    const {searchParams} = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const dateFrom = searchParams.get("dateFrom") || "";
    const dateTo = searchParams.get("dateTo") || "";
    const valueFrom = searchParams.get("valueFrom") || "";
    const valueTo = searchParams.get("valueTo") || "";
    const timezone = auth.tenant.time_zone;
    const skip = (page - 1) * limit;

    const where: any = {tenant_id: auth.tenant_id};

    if (search) {
      const idMatches = await prisma.$queryRaw<{id: string}[]>`
        SELECT id FROM data.sale WHERE tenant_id = ${auth.tenant_id}::uuid AND CAST(id AS TEXT) LIKE ${"%" + search.toLowerCase() + "%"}
      `;
      const matchedIds = idMatches.map((r) => r.id);
      where.OR = [
        {items: {some: {product: {name: {contains: search, mode: "insensitive" as const}}}}},
        ...(matchedIds.length > 0 ? [{id: {in: matchedIds}}] : []),
      ];
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
              product: {
                include: {unity_of_measure: {select: {id: true, unity: true}}},
              },
            },
          },
          packages: {
            include: {
              package: {
                include: {unity_of_measure: {select: {id: true, unity: true}}},
              },
            },
          },
          client: true,
        },
      }),
      prisma.sale.count({where}),
    ]);

    return success("get", {data, total, page, limit});
  });
}
