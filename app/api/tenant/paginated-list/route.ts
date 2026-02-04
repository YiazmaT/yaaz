import {authenticateRequest} from "@/src/lib/auth";
import {logCritical, LogModule, LogSource, logGet} from "@/src/lib/logger";
import {prisma} from "@/src/lib/prisma";
import {NextRequest, NextResponse} from "next/server";

const ROUTE = "/api/tenant/paginated-list";

export async function GET(req: NextRequest) {
  const auth = await authenticateRequest(LogModule.TENANT, ROUTE);
  if (auth.error) return auth.error;

  try {
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
        },
      }),
      prisma.tenant.count({where}),
    ]);

    const response = {data: tenants, total, page, limit};
    logGet({module: LogModule.TENANT, source: LogSource.API, content: response, userId: auth.user!.id, tenantId: auth.tenant_id, route: ROUTE});

    return NextResponse.json(response, {status: 200});
  } catch (error) {
    await logCritical({module: LogModule.TENANT, source: LogSource.API, error, route: ROUTE, userId: auth.user!.id, tenantId: auth.tenant_id});
    return NextResponse.json({error: "api.errors.somethingWentWrong"}, {status: 500});
  }
}
