import {LogModule} from "@/src/lib/logger";
import {prisma} from "@/src/lib/prisma";
import {withAuth} from "@/src/lib/route-handler";
import {NextRequest} from "next/server";
import Decimal from "decimal.js";
import {StockLevelRowDto} from "@/src/pages-content/reports/dto";

const ROUTE = "/api/reports/stock/stock-levels";

export async function GET(req: NextRequest) {
  return withAuth(LogModule.REPORTS, ROUTE, async ({auth, success}) => {
    const {searchParams} = new URL(req.url);
    const type = searchParams.get("type") || "all";
    const belowMinimumOnly = searchParams.get("belowMinimumOnly") === "true";

    const result: StockLevelRowDto[] = [];

    if (type === "all" || type === "ingredients") {
      const ingredients = await prisma.ingredient.findMany({
        where: {tenant_id: auth.tenant_id},
        select: {id: true, name: true, stock: true, min_stock: true, unity_of_measure: {select: {unity: true}}},
        orderBy: {name: "asc"},
      });

      ingredients.forEach((ing) => {
        const current = new Decimal(ing.stock.toString());
        const min = new Decimal(ing.min_stock.toString());
        const status = getStatus(current, min);

        if (belowMinimumOnly && status === "ok") return;

        result.push({
          id: ing.id,
          name: ing.name,
          type: "ingredient",
          currentStock: current.toFixed(2),
          minStock: min.toFixed(2),
          unit: ing.unity_of_measure?.unity ?? "",
          status,
        });
      });
    }

    if (type === "all" || type === "products") {
      const products = await prisma.product.findMany({
        where: {tenant_id: auth.tenant_id},
        select: {id: true, name: true, stock: true, min_stock: true},
        orderBy: {name: "asc"},
      });

      products.forEach((prod) => {
        const current = new Decimal(prod.stock);
        const min = new Decimal(prod.min_stock);
        const status = getStatus(current, min);

        if (belowMinimumOnly && status === "ok") return;

        result.push({
          id: prod.id,
          name: prod.name,
          type: "product",
          currentStock: current.toFixed(0),
          minStock: min.toFixed(0),
          unit: "un",
          status,
        });
      });
    }

    if (type === "all" || type === "packages") {
      const packages = await prisma.package.findMany({
        where: {tenant_id: auth.tenant_id},
        select: {id: true, name: true, stock: true, min_stock: true},
        orderBy: {name: "asc"},
      });

      packages.forEach((pkg) => {
        const current = new Decimal(pkg.stock.toString());
        const min = new Decimal(pkg.min_stock.toString());
        const status = getStatus(current, min);

        if (belowMinimumOnly && status === "ok") return;

        result.push({
          id: pkg.id,
          name: pkg.name,
          type: "package",
          currentStock: current.toFixed(2),
          minStock: min.toFixed(2),
          unit: "un",
          status,
        });
      });
    }

    return success("get", result);
  });
}

function getStatus(current: Decimal, min: Decimal): "ok" | "low" | "critical" {
  if (current.lessThanOrEqualTo(0)) return "critical";
  if (current.lessThanOrEqualTo(min)) return "low";
  return "ok";
}
