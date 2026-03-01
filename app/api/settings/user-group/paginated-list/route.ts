import {LogModule} from "@/src/lib/logger";
import {prisma} from "@/src/lib/prisma";
import {withAuth} from "@/src/lib/route-handler";
import {NextRequest} from "next/server";

const ROUTE = "/api/settings/user-group/paginated-list";

export async function GET(req: NextRequest) {
  return withAuth(LogModule.USER_GROUP, ROUTE, "admin", async ({auth, success}) => {
    const {searchParams} = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const skip = (page - 1) * limit;

    const where: any = {tenant_id: auth.tenant_id, active: true};

    if (search) {
      where.OR = [{name: {contains: search, mode: "insensitive" as const}}];
    }

    const [groups, total] = await Promise.all([
      prisma.userGroup.findMany({
        where,
        skip,
        take: limit,
        orderBy: {name: "asc"},
        select: {
          id: true,
          name: true,
          description: true,
          active: true,
          creation_date: true,
          last_edit_date: true,
          _count: {select: {users: true}},
          users: {select: {id: true, name: true, image: true, login: true}, take: 10, orderBy: {name: "asc"}},
        },
      }),
      prisma.userGroup.count({where}),
    ]);

    const data = groups.map((g) => ({
      id: g.id,
      name: g.name,
      description: g.description,
      active: g.active,
      creation_date: g.creation_date,
      last_edit_date: g.last_edit_date,
      user_count: g._count.users,
      users: g.users,
    }));

    return success("get", {data, total, page, limit});
  });
}
