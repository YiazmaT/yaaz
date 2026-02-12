import {LogModule} from "@/src/lib/logger";
import {prisma} from "@/src/lib/prisma";
import {withAuth} from "@/src/lib/route-handler";
import {StockAlertRow} from "@/src/pages-content/dashboard/dto";

const ROUTE = "/api/dashboard/stock-alerts";

export async function GET() {
  return withAuth(LogModule.DASHBOARD, ROUTE, async ({auth, success}) => {
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

    return success("get", {products, ingredients, packages});
  });
}
