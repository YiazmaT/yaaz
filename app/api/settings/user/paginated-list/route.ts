import {LogModule} from "@/src/lib/logger";
import {prisma} from "@/src/lib/prisma";
import {withAuth} from "@/src/lib/route-handler";
import {NextRequest} from "next/server";

const ROUTE = "/api/settings/user/paginated-list";

export async function GET(req: NextRequest) {
  return withAuth(LogModule.USER, ROUTE, async ({auth, success}) => {
    const {searchParams} = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const showInactives = searchParams.get("showInactives") === "true";
    const skip = (page - 1) * limit;

    const where: any = {tenant_id: auth.tenant_id};

    if (!showInactives) {
      where.active = true;
    }

    if (search) {
      where.OR = [{name: {contains: search, mode: "insensitive" as const}}, {login: {contains: search, mode: "insensitive" as const}}];
    }

    const [users, total, tenant] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: {name: "asc"},
        select: {
          id: true,
          name: true,
          login: true,
          admin: true,
          owner: true,
          active: true,
          image: true,
          create_date: true,
          last_edit_date: true,
        },
      }),
      prisma.user.count({where}),
      prisma.tenant.findUnique({where: {id: auth.tenant_id}, select: {max_user_amount: true}}),
    ]);

    return success("get", {data: users, total, page, limit, max_user_amount: tenant?.max_user_amount ?? 3});
  });
}
