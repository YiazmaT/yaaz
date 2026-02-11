import {LogModule} from "@/src/lib/logger";
import {generatePdfHtml} from "@/src/lib/pdf-template";
import {withAuth} from "@/src/lib/route-handler";
import {formatCurrency} from "@/src/utils/format-currency";
import {NextRequest, NextResponse} from "next/server";
import moment from "moment";

const ROUTE = "/api/reports/sales/profit-margin/pdf";

export async function GET(req: NextRequest) {
  return withAuth(LogModule.REPORTS, ROUTE, async (auth, log) => {
    const {searchParams} = new URL(req.url);
    const dataStr = searchParams.get("data") || "[]";
    const generatedAt = searchParams.get("generatedAt") || "";
    const dateFrom = searchParams.get("dateFrom") || "";
    const dateTo = searchParams.get("dateTo") || "";
    const data = JSON.parse(dataStr);
    const currency = auth.tenant.currency_type;

    const rows = data
      .map(
        (row: any) => `
      <tr>
        <td>${row.productName}</td>
        <td class="right">${row.quantitySold}</td>
        <td class="right">${formatCurrency(row.revenue, 2, currency)}</td>
        <td class="right">${formatCurrency(row.cost, 2, currency)}</td>
        <td class="right">${formatCurrency(row.profit, 2, currency)}</td>
        <td class="right">${row.marginPercent}%</td>
      </tr>
    `,
      )
      .join("");

    const totals = data.reduce(
      (acc: any, row: any) => ({
        quantitySold: acc.quantitySold + row.quantitySold,
        revenue: acc.revenue + parseFloat(row.revenue),
        cost: acc.cost + parseFloat(row.cost),
        profit: acc.profit + parseFloat(row.profit),
      }),
      {quantitySold: 0, revenue: 0, cost: 0, profit: 0},
    );

    const avgMargin = totals.revenue > 0 ? ((totals.profit / totals.revenue) * 100).toFixed(1) : "0.0";

    const content = `
      <h2>Margem de Lucro por Produto</h2>
      <p class="filter-info">Período: ${moment(dateFrom).format("DD/MM/YYYY")} a ${moment(dateTo).format("DD/MM/YYYY")}</p>
      <table>
        <thead>
          <tr>
            <th>Produto</th>
            <th class="right">Qtd Vendida</th>
            <th class="right">Receita</th>
            <th class="right">Custo</th>
            <th class="right">Lucro</th>
            <th class="right">Margem</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
        <tfoot>
          <tr class="total-row">
            <td><strong>Total</strong></td>
            <td class="right"><strong>${totals.quantitySold}</strong></td>
            <td class="right"><strong>${formatCurrency(totals.revenue, 2, currency)}</strong></td>
            <td class="right"><strong>${formatCurrency(totals.cost, 2, currency)}</strong></td>
            <td class="right"><strong>${formatCurrency(totals.profit, 2, currency)}</strong></td>
            <td class="right"><strong>${avgMargin}%</strong></td>
          </tr>
        </tfoot>
      </table>
    `;

    const html = generatePdfHtml({title: "Margem de Lucro", content, generatedAt, tenant: auth.tenant});

    log("get", {content: {dateFrom, dateTo, html}});

    return new NextResponse(html, {
      status: 200,
      headers: {"Content-Type": "text/html; charset=utf-8"},
    });
  });
}
