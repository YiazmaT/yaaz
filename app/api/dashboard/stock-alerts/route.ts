import {authenticateRequest} from "@/src/lib/auth";
import {logCritical, logGet, LogModule, LogSource} from "@/src/lib/logger";
import {prisma} from "@/src/lib/prisma";
import {NextResponse} from "next/server";

const ROUTE = "/api/dashboard/stock-alerts";

interface StockAlertRow {
  id: string;
  name: string;
  stock: number;
  min_stock: number;
}

export async function GET() {
  const auth = await authenticateRequest(LogModule.DASHBOARD, ROUTE);
  if (auth.error) return auth.error;

  try {
    const [products, ingredients, packages] = await Promise.all([
      prisma.$queryRaw<StockAlertRow[]>`
        SELECT id, name, stock, min_stock
        FROM data.product
        WHERE tenant_id = ${auth.tenant_id}::uuid AND min_stock > 0 AND stock < min_stock
        ORDER BY name ASC
      `,
      prisma.$queryRaw<StockAlertRow[]>`
        SELECT id, name, stock::numeric, min_stock::numeric
        FROM data.ingredient
        WHERE tenant_id = ${auth.tenant_id}::uuid AND min_stock > 0 AND stock < min_stock
        ORDER BY name ASC
      `,
      prisma.$queryRaw<StockAlertRow[]>`
        SELECT id, name, stock::numeric, min_stock::numeric
        FROM data.package
        WHERE tenant_id = ${auth.tenant_id}::uuid AND min_stock > 0 AND stock < min_stock
        ORDER BY name ASC
      `,
    ]);

    const returnPayload = {products, ingredients, packages};

    logGet({module: LogModule.DASHBOARD, source: LogSource.API, route: ROUTE, content: returnPayload, userId: auth.user!.id, tenantId: auth.tenant_id});

    return NextResponse.json(returnPayload);
  } catch (error) {
    await logCritical({module: LogModule.DASHBOARD, source: LogSource.API, route: ROUTE, error, userId: auth.user!.id, tenantId: auth.tenant_id});
    return NextResponse.json({error: "api.errors.somethingWentWrong"}, {status: 500});
  }
}
