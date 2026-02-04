import {authenticateRequest} from "@/src/lib/auth";
import {logCritical, logError, LogModule, LogSource, logDelete} from "@/src/lib/logger";
import {prisma} from "@/src/lib/prisma";
import {DeleteSaleDto} from "@/src/pages-content/sales/dto";
import {NextRequest, NextResponse} from "next/server";

const ROUTE = "/api/sale/delete";

export async function DELETE(req: NextRequest) {
  const auth = await authenticateRequest(LogModule.SALE, ROUTE);
  if (auth.error) return auth.error;

  try {
    const {id}: DeleteSaleDto = await req.json();

    if (!id) {
      logError({
        module: LogModule.SALE,
        source: LogSource.API,
        message: "api.errors.missingRequiredFields",
        route: ROUTE,
        userId: auth.user!.id,
        tenantId: auth.tenant_id,
      });
      return NextResponse.json({error: "api.errors.missingRequiredFields"}, {status: 400});
    }

    const sale = await prisma.sale.findUnique({where: {id, tenant_id: auth.tenant_id}});

    if (!sale) {
      logError({
        module: LogModule.SALE,
        source: LogSource.API,
        message: "Sale not found",
        content: {id},
        route: ROUTE,
        userId: auth.user!.id,
        tenantId: auth.tenant_id,
      });
      return NextResponse.json({error: "api.errors.somethingWentWrong"}, {status: 404});
    }

    await prisma.sale.delete({where: {id}});

    logDelete({module: LogModule.SALE, source: LogSource.API, content: sale, route: ROUTE, userId: auth.user!.id, tenantId: auth.tenant_id});

    return NextResponse.json({success: true}, {status: 200});
  } catch (error) {
    await logCritical({module: LogModule.SALE, source: LogSource.API, error, route: ROUTE, userId: auth.user!.id, tenantId: auth.tenant_id});
    return NextResponse.json({error: "api.errors.somethingWentWrong"}, {status: 500});
  }
}
