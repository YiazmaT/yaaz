import {LogModule} from "@/src/lib/logger";
import {generatePdfHtml} from "@/src/lib/pdf-template";
import {prisma} from "@/src/lib/prisma";
import {withAuth} from "@/src/lib/route-handler";
import {formatCurrency} from "@/src/utils/format-currency";
import {startOfDay, endOfDay, parseISO, eachDayOfInterval} from "date-fns";
import {fromZonedTime} from "date-fns-tz";
import Decimal from "decimal.js";
import {NextRequest, NextResponse} from "next/server";
import moment from "moment";

const ROUTE = "/api/reports/sales/sales-summary";

export async function GET(req: NextRequest) {
  return withAuth(LogModule.REPORTS, ROUTE, async ({auth, success, error, log}) => {
    const {searchParams} = new URL(req.url);
    const dateFrom = searchParams.get("dateFrom") || "";
    const dateTo = searchParams.get("dateTo") || "";
    const pdf = searchParams.get("pdf") === "true";
    const generatedAt = searchParams.get("generatedAt") || "";

    if (!dateFrom || !dateTo) return error("api.errors.missingRequiredFields", 400);

    const timezone = auth.tenant.time_zone;
    const zonedStart = startOfDay(parseISO(dateFrom));
    const zonedEnd = endOfDay(parseISO(dateTo));
    const utcStart = fromZonedTime(zonedStart, timezone);
    const utcEnd = fromZonedTime(zonedEnd, timezone);

    const sales = await prisma.sale.findMany({
      where: {
        tenant_id: auth.tenant_id,
        is_quote: false,
        creation_date: {gte: utcStart, lte: utcEnd},
      },
      select: {
        id: true,
        total: true,
        payment_method: {select: {name: true}},
        creation_date: true,
      },
      orderBy: {creation_date: "asc"},
    });

    const paymentMethods = [...new Set(sales.map((s) => s.payment_method.name))];
    const days = eachDayOfInterval({start: parseISO(dateFrom), end: parseISO(dateTo)});

    const rows = days
      .map((day) => {
        const dayStart = fromZonedTime(startOfDay(day), timezone);
        const dayEnd = fromZonedTime(endOfDay(day), timezone);

        const daySales = sales.filter((sale) => {
          const saleDate = new Date(sale.creation_date);
          return saleDate >= dayStart && saleDate <= dayEnd;
        });

        const totalSales = daySales.reduce((acc, sale) => acc.plus(new Decimal(sale.total.toString())), new Decimal(0));
        const transactionCount = daySales.length;
        const averageTicket = transactionCount > 0 ? totalSales.div(transactionCount) : new Decimal(0);

        const byPaymentMethod: Record<string, Decimal> = Object.fromEntries(paymentMethods.map((pm) => [pm, new Decimal(0)]));
        daySales.forEach((sale) => {
          byPaymentMethod[sale.payment_method.name] = byPaymentMethod[sale.payment_method.name].plus(new Decimal(sale.total.toString()));
        });

        return {
          date: day.toISOString(),
          totalSales: totalSales.toFixed(2),
          transactionCount,
          averageTicket: averageTicket.toFixed(2),
          byPaymentMethod: Object.fromEntries(Object.entries(byPaymentMethod).map(([key, val]) => [key, val.toFixed(2)])),
        };
      })
      .filter((row) => row.transactionCount > 0);

    if (!pdf) return success("get", {paymentMethods, rows});

    const currency = auth.tenant.currency_type;

    const pmHeaders = paymentMethods.map((pm) => `<th class="right">${pm}</th>`).join("");

    const tableRows = rows
      .map((row) => {
        const pmCells = paymentMethods
          .map((pm) => `<td class="right">${formatCurrency(row.byPaymentMethod[pm] || "0", 2, currency)}</td>`)
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
      (acc, row) => {
        const byPm: Record<string, number> = {...acc.byPaymentMethod};
        paymentMethods.forEach((pm) => {
          byPm[pm] = (byPm[pm] || 0) + parseFloat(row.byPaymentMethod[pm] || "0");
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
        byPaymentMethod: Object.fromEntries(paymentMethods.map((pm) => [pm, 0])),
      },
    );

    const pmTotalCells = paymentMethods
      .map((pm) => `<td class="right"><strong>${formatCurrency(totals.byPaymentMethod[pm] || 0, 2, currency)}</strong></td>`)
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

    log("get", {content: {dateFrom, dateTo}});

    return new NextResponse(html, {
      status: 200,
      headers: {"Content-Type": "text/html; charset=utf-8"},
    });
  });
}
