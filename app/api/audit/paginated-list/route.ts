import {type NextRequest} from "next/server";
import {fromZonedTime} from "date-fns-tz";
import {prisma} from "@/src/lib/prisma";
import {LogModule, LogType} from "@/src/lib/logger";
import {withAuth} from "@/src/lib/route-handler";
import {ACTION_ROUTE_PATTERNS} from "@/src/pages-content/settings/audit/constants";

const ROUTE = "/api/audit/paginated-list";

export async function GET(req: NextRequest) {
  return withAuth(LogModule.AUDIT, ROUTE, "admin", async ({auth, success}) => {
    const {searchParams} = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "25");
    const search = searchParams.get("search") || "";
    const module = searchParams.get("module") || "";
    const action_type = searchParams.get("action_type") || "";
    const date_from = searchParams.get("date_from") || "";
    const date_to = searchParams.get("date_to") || "";
    const skip = (page - 1) * limit;

    const where: any = {
      tenant_id: auth.tenant_id,
      type: LogType.SUCCESS,
    };

    if (module) {
      where.module = module;
    }

    if (action_type && ACTION_ROUTE_PATTERNS[action_type]) {
      where.OR = ACTION_ROUTE_PATTERNS[action_type].map((pattern) => ({
        route: {endsWith: pattern},
      }));
    }

    if (date_from || date_to) {
      const timezone = auth.tenant.time_zone;
      where.create_date = {
        ...(date_from && {gte: fromZonedTime(`${date_from}T00:00:00`, timezone)}),
        ...(date_to && {lte: fromZonedTime(`${date_to}T23:59:59.999`, timezone)}),
      };
    }

    if (search) {
      const searchFilter = {
        OR: [
          {route: {contains: search, mode: "insensitive" as const}},
          {message: {contains: search, mode: "insensitive" as const}},
          {user: {name: {contains: search, mode: "insensitive" as const}}},
        ],
      };
      where.AND = [searchFilter];
    }

    const [items, total] = await Promise.all([
      prisma.log.findMany({
        where,
        skip,
        take: limit,
        orderBy: {create_date: "desc"},
        select: {
          id: true,
          type: true,
          create_date: true,
          message: true,
          route: true,
          source: true,
          module: true,
          content: true,
          error: true,
          user_id: true,
          user: {select: {name: true, login: true, image: true}},
        },
      }),
      prisma.log.count({where}),
    ]);

    const data = items.map((item) => ({
      id: item.id,
      type: item.type,
      create_date: item.create_date,
      message: item.message,
      route: item.route,
      source: item.source,
      module: item.module,
      content: item.content as Record<string, any> | null,
      error: item.error as Record<string, any> | null,
      user_id: item.user_id,
      user: item.user ?? null,
      action_type: deriveActionType(item.route),
    }));

    return success("get", {data, total, page, limit});
  });
}

function deriveActionType(route: string | null): "create" | "update" | "delete" | "other" {
  if (!route) return "other";
  for (const [type, patterns] of Object.entries(ACTION_ROUTE_PATTERNS)) {
    if (patterns.some((p) => route.endsWith(p))) return type as "create" | "update" | "delete";
  }
  return "other";
}
