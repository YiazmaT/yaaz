import {LogModule} from "@/src/lib/logger";
import {prisma} from "@/src/lib/prisma";
import {withAuth} from "@/src/lib/route-handler";
import {NextRequest, NextResponse} from "next/server";

const ROUTE = "/api/tenant/paginated-list";

export async function GET(req: NextRequest) {
  return withAuth(LogModule.TENANT, ROUTE, async (auth, log) => {
    const {searchParams} = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const skip = (page - 1) * limit;

    const where = search ? {OR: [{name: {contains: search, mode: "insensitive" as const}}]} : {};

    const [tenants, total] = await Promise.all([
      prisma.tenant.findMany({
        where,
        skip,
        take: limit,
        orderBy: {name: "asc"},
        select: {
          id: true,
          name: true,
          creation_date: true,
          logo: true,
          primary_color: true,
          secondary_color: true,
          time_zone: true,
          currency_type: true,
        },
      }),
      prisma.tenant.count({where}),
    ]);

    const response = {data: tenants, total, page, limit};

    log("get", {content: response});

    return NextResponse.json(response, {status: 200});
  });
}
