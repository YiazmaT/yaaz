import {LogModule} from "@/src/lib/logger";
import {generatePdfHtml} from "@/src/lib/pdf-template";
import {prisma} from "@/src/lib/prisma";
import {withAuth} from "@/src/lib/route-handler";
import {serverTranslate} from "@/src/lib/server-translate";
import {formatCurrency} from "@/src/utils/format-currency";
import {startOfDay, endOfDay, parseISO} from "date-fns";
import {fromZonedTime} from "date-fns-tz";
import {Prisma} from "@prisma/client";
import moment from "moment";
import {NextRequest, NextResponse} from "next/server";
import {SalesPerProductRawRow} from "@/src/pages-content/reports/report-types/sales-per-product/dto";

const ROUTE = "/api/reports/sales/sales-per-product";

export async function GET(req: NextRequest) {
  return withAuth(LogModule.REPORTS, ROUTE, null, async ({auth, success, error, log}) => {
    const {searchParams} = new URL(req.url);
    const dateFrom = searchParams.get("dateFrom") || "";
    const dateTo = searchParams.get("dateTo") || "";
    const allProducts = searchParams.get("allProducts") === "true";
    const productIds = searchParams.getAll("productIds");
    const pdf = searchParams.get("pdf") === "true";
    const generatedAt = searchParams.get("generatedAt") || "";

    if (!dateFrom || !dateTo) return error("api.errors.missingRequiredFields", 400);
    if (!allProducts && productIds.length === 0) return error("api.errors.missingRequiredFields", 400);

    const timezone = auth.tenant.time_zone;
    const utcStart = fromZonedTime(startOfDay(parseISO(dateFrom)), timezone);
    const utcEnd = fromZonedTime(endOfDay(parseISO(dateTo)), timezone);

    const productFilter = allProducts
      ? Prisma.sql``
      : Prisma.sql`AND si.product_id = ANY(ARRAY[${Prisma.join(productIds.map((id) => Prisma.sql`${id}::uuid`))}])`;

    const rawRows = await prisma.$queryRaw<SalesPerProductRawRow[]>(Prisma.sql`
      SELECT
        p.id AS product_id,
        p.code,
        p.name,
        p.image,
        COUNT(DISTINCT si.sale_id) AS sales_count,
        SUM(si.quantity)::text AS quantity_sold,
        SUM(si.quantity * si.unit_price)::text AS revenue,
        (
          SUM(si.quantity * si.unit_price) -
          SUM(si.quantity) * COALESCE(
            (SELECT pc.price FROM data.product_cost pc WHERE pc.product_id = p.id ORDER BY pc.creation_date DESC LIMIT 1),
            0
          )
        )::text AS profit
      FROM data.sale_item si
      JOIN data.sale s ON s.id = si.sale_id
      JOIN data.product p ON p.id = si.product_id
      WHERE si.tenant_id = ${auth.tenant_id}::uuid
        AND s.is_quote = false
        AND s.creation_date >= ${utcStart}
        AND s.creation_date <= ${utcEnd}
        ${productFilter}
      GROUP BY p.id, p.code, p.name, p.image
      ORDER BY SUM(si.quantity * si.unit_price) DESC
    `);

    const rows = rawRows.map((r) => ({
      productId: r.product_id,
      code: Number(r.code),
      name: r.name,
      image: r.image,
      salesCount: Number(r.sales_count),
      quantitySold: r.quantity_sold,
      revenue: r.revenue,
      profit: r.profit,
    }));

    if (!pdf) return success("get", {rows});

    const currency = auth.tenant.currency_type;
    const title = serverTranslate("reports.types.salesPerProduct");

    const tableRows = rows
      .map(
        (row) => `
        <tr>
          <td>${row.code} - ${row.name}</td>
          <td class="right">${row.salesCount}</td>
          <td class="right">${parseFloat(row.quantitySold).toLocaleString("pt-BR")}</td>
          <td class="right">${formatCurrency(row.revenue, 2, currency)}</td>
          <td class="right">${formatCurrency(row.profit, 2, currency)}</td>
        </tr>
      `,
      )
      .join("");

    const totals = rows.reduce(
      (acc, row) => ({
        quantitySold: acc.quantitySold + parseFloat(row.quantitySold),
        revenue: acc.revenue + parseFloat(row.revenue),
        profit: acc.profit + parseFloat(row.profit),
      }),
      {quantitySold: 0, revenue: 0, profit: 0},
    );

    const content = `
      <h2>${title}</h2>
      <p class="filter-info">${serverTranslate("reports.period")}: ${moment(dateFrom).format("DD/MM/YYYY")} - ${moment(dateTo).format("DD/MM/YYYY")}</p>
      <table>
        <thead>
          <tr>
            <th>${serverTranslate("reports.columns.product")}</th>
            <th class="right">${serverTranslate("reports.columns.salesCount")}</th>
            <th class="right">${serverTranslate("reports.columns.quantitySold")}</th>
            <th class="right">${serverTranslate("reports.columns.revenue")}</th>
            <th class="right">${serverTranslate("reports.columns.profit")}</th>
          </tr>
        </thead>
        <tbody>${tableRows}</tbody>
        <tfoot>
          <tr class="total-row">
            <td><strong>${serverTranslate("global.total")}</strong></td>
            <td></td>
            <td class="right"><strong>${totals.quantitySold.toLocaleString("pt-BR")}</strong></td>
            <td class="right"><strong>${formatCurrency(totals.revenue, 2, currency)}</strong></td>
            <td class="right"><strong>${formatCurrency(totals.profit, 2, currency)}</strong></td>
          </tr>
        </tfoot>
      </table>
    `;

    const html = generatePdfHtml({title, content, generatedAt, tenant: auth.tenant});

    log("get", {content: {dateFrom, dateTo, allProducts, productIds}});

    return new NextResponse(html, {
      status: 200,
      headers: {"Content-Type": "text/html; charset=utf-8"},
    });
  });
}
