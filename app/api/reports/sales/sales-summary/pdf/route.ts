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
        <td>${moment(row.date).format("DD/MM/YYYY")}</td>
        <td class="right">${formatCurrency(row.totalSales, 2, currency)}</td>
        <td class="right">${row.transactionCount}</td>
        <td class="right">${formatCurrency(row.averageTicket, 2, currency)}</td>
        <td class="right">${formatCurrency(row.cash, 2, currency)}</td>
        <td class="right">${formatCurrency(row.credit, 2, currency)}</td>
        <td class="right">${formatCurrency(row.debit, 2, currency)}</td>
        <td class="right">${formatCurrency(row.pix, 2, currency)}</td>
        <td class="right">${formatCurrency(row.iFood, 2, currency)}</td>
      </tr>
    `,
      )
      .join("");

    const totals = data.reduce(
      (acc: any, row: any) => ({
        totalSales: acc.totalSales + parseFloat(row.totalSales),
        transactionCount: acc.transactionCount + row.transactionCount,
        cash: acc.cash + parseFloat(row.cash),
        credit: acc.credit + parseFloat(row.credit),
        debit: acc.debit + parseFloat(row.debit),
        pix: acc.pix + parseFloat(row.pix),
        iFood: acc.iFood + parseFloat(row.iFood),
      }),
      {totalSales: 0, transactionCount: 0, cash: 0, credit: 0, debit: 0, pix: 0, iFood: 0},
    );

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
            <th class="right">Dinheiro</th>
            <th class="right">Crédito</th>
            <th class="right">Débito</th>
            <th class="right">Pix</th>
            <th class="right">iFood</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
        <tfoot>
          <tr class="total-row">
            <td><strong>Total</strong></td>
            <td class="right"><strong>${formatCurrency(totals.totalSales, 2, currency)}</strong></td>
            <td class="right"><strong>${totals.transactionCount}</strong></td>
            <td class="right"><strong>${formatCurrency(totals.transactionCount > 0 ? totals.totalSales / totals.transactionCount : 0, 2, currency)}</strong></td>
            <td class="right"><strong>${formatCurrency(totals.cash, 2, currency)}</strong></td>
            <td class="right"><strong>${formatCurrency(totals.credit, 2, currency)}</strong></td>
            <td class="right"><strong>${formatCurrency(totals.debit, 2, currency)}</strong></td>
            <td class="right"><strong>${formatCurrency(totals.pix, 2, currency)}</strong></td>
            <td class="right"><strong>${formatCurrency(totals.iFood, 2, currency)}</strong></td>
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
