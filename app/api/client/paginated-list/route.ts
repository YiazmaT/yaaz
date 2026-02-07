import {authenticateRequest} from "@/src/lib/auth";
import {logCritical, LogModule, LogSource, logGet} from "@/src/lib/logger";
import {prisma} from "@/src/lib/prisma";
import {NextRequest, NextResponse} from "next/server";

const ROUTE = "/api/client/paginated-list";

export async function GET(req: NextRequest) {
  const auth = await authenticateRequest(LogModule.CLIENT, ROUTE);
  if (auth.error) return auth.error;

  try {
    const {searchParams} = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const skip = (page - 1) * limit;

    const where = search
      ? {
          tenant_id: auth.tenant_id,
          OR: [
            {name: {contains: search, mode: "insensitive" as const}},
            {email: {contains: search, mode: "insensitive" as const}},
            {phone: {contains: search, mode: "insensitive" as const}},
            {cpf: {contains: search, mode: "insensitive" as const}},
            {cnpj: {contains: search, mode: "insensitive" as const}},
          ],
        }
      : {tenant_id: auth.tenant_id};

    const [clients, total] = await Promise.all([
      prisma.client.findMany({
        where,
        skip,
        take: limit,
        orderBy: {name: "asc"},
        omit: {creation_date: true, creator_id: true, last_edit_date: true, last_editor_id: true},
      }),
      prisma.client.count({where}),
    ]);

    const data = clients.map(({is_company, ...rest}) => ({...rest, isCompany: is_company}));
    const response = {data, total, page, limit};
    logGet({module: LogModule.CLIENT, source: LogSource.API, content: response, userId: auth.user!.id, tenantId: auth.tenant_id, route: ROUTE});

    return NextResponse.json(response, {status: 200});
  } catch (error) {
    await logCritical({module: LogModule.CLIENT, source: LogSource.API, error, route: ROUTE, userId: auth.user!.id, tenantId: auth.tenant_id});
    return NextResponse.json({error: "api.errors.somethingWentWrong"}, {status: 500});
  }
}
