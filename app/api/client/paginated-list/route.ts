import {LogModule} from "@/src/lib/logger";
import {prisma} from "@/src/lib/prisma";
import {withAuth} from "@/src/lib/route-handler";
import {NextRequest} from "next/server";

const ROUTE = "/api/client/paginated-list";

export async function GET(req: NextRequest) {
  return withAuth(LogModule.CLIENT, ROUTE, async ({auth, success}) => {
    const {searchParams} = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const showInactives = searchParams.get("showInactives") === "true";
    const skip = (page - 1) * limit;

    const where: any = {tenant_id: auth.tenant_id};
    if (!showInactives) where.active = true;
    if (search) {
      const searchAsNumber = parseInt(search);
      where.OR = [
        {name: {contains: search, mode: "insensitive" as const}},
        {description: {contains: search, mode: "insensitive" as const}},
        {email: {contains: search, mode: "insensitive" as const}},
        {phone: {contains: search, mode: "insensitive" as const}},
        {cpf: {contains: search, mode: "insensitive" as const}},
        {cnpj: {contains: search, mode: "insensitive" as const}},
        ...(!isNaN(searchAsNumber) ? [{code: searchAsNumber}] : []),
      ];
    }

    const [clients, total] = await Promise.all([
      prisma.client.findMany({
        where,
        skip,
        take: limit,
        orderBy: {name: "asc"},
        omit: {creation_date: true, creator_id: true, last_edit_date: true, last_editor_id: true},
        include: {
          address: {
            omit: {tenant_id: true, client_id: true, creation_date: true, creator_id: true, last_edit_date: true, last_editor_id: true},
          },
        },
      }),
      prisma.client.count({where}),
    ]);

    const data = clients.map(({is_company, ...rest}) => ({...rest, isCompany: is_company}));

    return success("get", {data, total, page, limit});
  });
}
