import {LogModule} from "@/src/lib/logger";
import {generatePdfHtml} from "@/src/lib/pdf-template";
import {prisma} from "@/src/lib/prisma";
import {withAuth} from "@/src/lib/route-handler";
import {serverTranslate} from "@/src/lib/server-translate";
import {StockLevelRowDto} from "@/src/pages-content/reports/dto";
import Decimal from "decimal.js";
import {NextRequest, NextResponse} from "next/server";

const ROUTE = "/api/reports/stock/stock-levels";

function getStatus(current: Decimal, min: Decimal): "ok" | "low" | "critical" {
  if (current.lessThanOrEqualTo(0)) return "critical";
  if (current.lessThanOrEqualTo(min)) return "low";
  return "ok";
}

export async function GET(req: NextRequest) {
  return withAuth(LogModule.REPORTS, ROUTE, async ({auth, success, log}) => {
    const {searchParams} = new URL(req.url);
    const type = searchParams.get("type") || "all";
    const belowMinimumOnly = searchParams.get("belowMinimumOnly") === "true";
    const pdf = searchParams.get("pdf") === "true";
    const generatedAt = searchParams.get("generatedAt") || "";

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

    if (!pdf) return success("get", result);

    const typeLabel = serverTranslate(`reports.stockTypes.${type}`);
    const belowMinimumLabel = belowMinimumOnly ? serverTranslate("global.yes") : serverTranslate("global.no");

    const rows = result
      .map(
        (row) => `
      <tr class="status-${row.status}">
        <td>${row.name}</td>
        <td>${serverTranslate(`reports.stockTypes.${row.type}`)}</td>
        <td class="right">${row.currentStock}</td>
        <td class="right">${row.minStock}</td>
        <td>${row.unit}</td>
        <td class="center">${serverTranslate(`reports.status.${row.status}`)}</td>
      </tr>
    `,
      )
      .join("");

    const title = serverTranslate("reports.types.stockLevels");
    const content = `
      <h2>${title}</h2>
      <p class="filter-info">${serverTranslate("reports.filters.stockType")}: ${typeLabel} | ${serverTranslate("reports.filters.belowMinimumOnly")}: ${belowMinimumLabel}</p>
      <table>
        <thead>
          <tr>
            <th>${serverTranslate("reports.columns.name")}</th>
            <th>${serverTranslate("reports.columns.type")}</th>
            <th class="right">${serverTranslate("reports.columns.currentStock")}</th>
            <th class="right">${serverTranslate("reports.columns.minStock")}</th>
            <th>${serverTranslate("reports.columns.unit")}</th>
            <th class="center">${serverTranslate("reports.columns.status")}</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    `;

    const html = generatePdfHtml({title, content, generatedAt, tenant: auth.tenant});

    log("get", {content: {type, belowMinimumOnly}});

    return new NextResponse(html, {
      status: 200,
      headers: {"Content-Type": "text/html; charset=utf-8"},
    });
  });
}
