import {LogModule} from "@/src/lib/logger";
import {prismaUnscoped} from "@/src/lib/prisma";
import {withYaazAuth} from "@/src/lib/yaaz-route-handler";
import {NextRequest} from "next/server";

const ROUTE = "/api/yaaz/tenant/paginated-list";

export async function GET(req: NextRequest) {
  return withYaazAuth(LogModule.TENANT, ROUTE, async ({success}) => {
    const {searchParams} = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const skip = (page - 1) * limit;

    const where = search ? {OR: [{name: {contains: search, mode: "insensitive" as const}}]} : {};

    const [tenants, total] = await Promise.all([
      prismaUnscoped.tenant.findMany({
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
          owner_user_id: true,
        },
      }),
      prismaUnscoped.tenant.count({where}),
    ]);

    const ownerIds = tenants.map((t) => t.owner_user_id).filter(Boolean) as string[];

    const ownerUsers =
      ownerIds.length > 0
        ? await prismaUnscoped.user.findMany({
            where: {id: {in: ownerIds}},
            select: {id: true, name: true, login: true, image: true, pending_password: true, setup_email_sent_at: true},
          })
        : [];

    const ownerMap = Object.fromEntries(ownerUsers.map((u) => [u.id, u]));

    const data = tenants.map((t) => ({
      ...t,
      owner: t.owner_user_id ? (ownerMap[t.owner_user_id] ?? null) : null,
    }));

    return success("get", {data, total, page, limit});
  });
}
