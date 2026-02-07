import {authenticateRequest} from "@/src/lib/auth";
import {logCritical, logError, LogModule, LogSource, logDelete} from "@/src/lib/logger";
import {prisma} from "@/src/lib/prisma";
import {deleteFromR2, extractR2KeyFromUrl} from "@/src/lib/r2";
import {DeleteClientDto} from "@/src/pages-content/client/dto";
import {NextRequest, NextResponse} from "next/server";

const ROUTE = "/api/client/delete";

export async function DELETE(req: NextRequest) {
  const auth = await authenticateRequest(LogModule.CLIENT, ROUTE);
  if (auth.error) return auth.error;

  try {
    const {id}: DeleteClientDto = await req.json();

    if (!id) {
      logError({
        module: LogModule.CLIENT,
        source: LogSource.API,
        message: "api.errors.missingRequiredFields",
        route: ROUTE,
        userId: auth.user!.id,
        tenantId: auth.tenant_id,
      });
      return NextResponse.json({error: "api.errors.missingRequiredFields"}, {status: 400});
    }

    const client = await prisma.client.findUnique({where: {id, tenant_id: auth.tenant_id}, include: {sales: {take: 1}}});

    if (!client) {
      logError({
        module: LogModule.CLIENT,
        source: LogSource.API,
        message: "Client not found",
        content: {id},
        route: ROUTE,
        userId: auth.user!.id,
        tenantId: auth.tenant_id,
      });
      return NextResponse.json({error: "api.errors.dataNotFound"}, {status: 404});
    }

    if (client.sales.length > 0) {
      logError({
        module: LogModule.CLIENT,
        source: LogSource.API,
        message: "Client is in use by sales",
        content: client,
        route: ROUTE,
        userId: auth.user!.id,
        tenantId: auth.tenant_id,
      });
      return NextResponse.json({error: "clients.errors.inUseBySales"}, {status: 400});
    }

    if (client.image) {
      const key = extractR2KeyFromUrl(client.image);
      if (key) {
        await deleteFromR2(key, auth.tenant_id);
      }
    }

    await prisma.client.delete({where: {id}});

    logDelete({module: LogModule.CLIENT, source: LogSource.API, content: {client}, route: ROUTE, userId: auth.user!.id, tenantId: auth.tenant_id});

    return NextResponse.json({success: true}, {status: 200});
  } catch (error) {
    await logCritical({module: LogModule.CLIENT, source: LogSource.API, error, route: ROUTE, userId: auth.user!.id, tenantId: auth.tenant_id});
    return NextResponse.json({error: "api.errors.somethingWentWrong"}, {status: 500});
  }
}
