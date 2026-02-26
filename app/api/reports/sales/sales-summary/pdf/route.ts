import {LogModule} from "@/src/lib/logger";
import {generatePdfHtml} from "@/src/lib/pdf-template";
import {withAuth} from "@/src/lib/route-handler";
import {formatCurrency} from "@/src/utils/format-currency";
import {NextRequest, NextResponse} from "next/server";
import moment from "moment";

const ROUTE = "/api/reports/sales/sales-summary/pdf";

export async function GET(req: NextRequest) {
  return withAuth(LogModule.REPORTS, ROUTE, async ({auth, log}) => {
    const {searchParams} = new URL(req.url);
    const dataStr = searchParams.get("data") || "{}";
    const generatedAt = searchParams.get("generatedAt") || "";
    const dateFrom = searchParams.get("dateFrom") || "";
    const dateTo = searchParams.get("dateTo") || "";
    const {paymentMethods = [], rows = []} = JSON.parse(dataStr) as {paymentMethods: string[]; rows: any[]};
    const currency = auth.tenant.currency_type;

    const pmHeaders = paymentMethods.map((pm: string) => `<th class="right">${pm}</th>`).join("");

    const tableRows = rows
      .map((row: any) => {
        const pmCells = paymentMethods
          .map((pm: string) => `<td class="right">${formatCurrency(row.byPaymentMethod?.[pm] || "0", 2, currency)}</td>`)
          .join("");
        return `
      <tr>
        <td>${moment(row.date).format("DD/MM/YYYY")}</td>
        <td class="right">${formatCurrency(row.totalSales, 2, currency)}</td>
        <td class="right">${row.transactionCount}</td>
        <td class="right">${formatCurrency(row.averageTicket, 2, currency)}</td>
        ${pmCells}
      </tr>
    `;
      })
      .join("");

    const totals = rows.reduce(
      (acc: any, row: any) => {
        const byPm: Record<string, number> = {...acc.byPaymentMethod};
        paymentMethods.forEach((pm: string) => {
          byPm[pm] = (byPm[pm] || 0) + parseFloat(row.byPaymentMethod?.[pm] || "0");
        });
        return {
          totalSales: acc.totalSales + parseFloat(row.totalSales),
          transactionCount: acc.transactionCount + row.transactionCount,
          byPaymentMethod: byPm,
        };
      },
      {
        totalSales: 0,
        transactionCount: 0,
        byPaymentMethod: Object.fromEntries(paymentMethods.map((pm: string) => [pm, 0])),
      },
    );

    const pmTotalCells = paymentMethods
      .map((pm: string) => `<td class="right"><strong>${formatCurrency(totals.byPaymentMethod[pm] || 0, 2, currency)}</strong></td>`)
      .join("");
    const averageTicket = totals.transactionCount > 0 ? totals.totalSales / totals.transactionCount : 0;

    const content = `
      <h2>Resumo de Vendas</h2>
      <p class="filter-info">Período: ${moment(dateFrom).format("DD/MM/YYYY")} a ${moment(dateTo).format("DD/MM/YYYY")}</p>
      <table>
        <thead>
          <tr>
            <th>Data</th>
            <th class="right">Total</th>
            <th class="right">Transações</th>
            <th class="right">Ticket Médio</th>
            ${pmHeaders}
          </tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
        <tfoot>
          <tr class="total-row">
            <td><strong>Total</strong></td>
            <td class="right"><strong>${formatCurrency(totals.totalSales, 2, currency)}</strong></td>
            <td class="right"><strong>${totals.transactionCount}</strong></td>
            <td class="right"><strong>${formatCurrency(averageTicket, 2, currency)}</strong></td>
            ${pmTotalCells}
          </tr>
        </tfoot>
      </table>
    `;

    const html = generatePdfHtml({title: "Resumo de Vendas", content, generatedAt, tenant: auth.tenant});

    log("get", {content: {dateFrom, dateTo, html}});

    return new NextResponse(html, {
      status: 200,
      headers: {"Content-Type": "text/html; charset=utf-8"},
    });
  });
}
