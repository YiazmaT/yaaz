import {LogModule} from "@/src/lib/logger";
import {generatePdfHtml} from "@/src/lib/pdf-template";
import {prisma} from "@/src/lib/prisma";
import {withAuth} from "@/src/lib/route-handler";
import {serverTranslate} from "@/src/lib/server-translate";
import {formatCurrency} from "@/src/utils/format-currency";
import {startOfDay, endOfDay, parseISO} from "date-fns";
import {fromZonedTime} from "date-fns-tz";
import Decimal from "decimal.js";
import {NextRequest, NextResponse} from "next/server";
import moment from "moment";

const ROUTE = "/api/reports/finance/movement";

export async function GET(req: NextRequest) {
  return withAuth(LogModule.REPORTS, ROUTE, async ({auth, success, error, log}) => {
    const {searchParams} = new URL(req.url);
    const dateFrom = searchParams.get("dateFrom") || "";
    const dateTo = searchParams.get("dateTo") || "";
    const pdf = searchParams.get("pdf") === "true";
    const generatedAt = searchParams.get("generatedAt") || "";

    if (!dateFrom || !dateTo) return error("api.errors.missingRequiredFields", 400);

    const timezone = auth.tenant.time_zone;
    const utcStart = fromZonedTime(startOfDay(parseISO(dateFrom)), timezone);
    const utcEnd = fromZonedTime(endOfDay(parseISO(dateTo)), timezone);

    const [billsRaw, salesRaw] = await Promise.all([
      prisma.bill.findMany({
        where: {
          tenant_id: auth.tenant_id,
          due_date: {gte: utcStart, lte: utcEnd},
        },
        select: {
          amount: true,
          category: {select: {name: true}},
        },
      }),
      prisma.sale.findMany({
        where: {
          tenant_id: auth.tenant_id,
          is_quote: false,
          creation_date: {gte: utcStart, lte: utcEnd},
        },
        select: {
          total: true,
          payment_method: {select: {name: true}},
        },
      }),
    ]);

    const othersLabel = serverTranslate("reports.movement.others");

    const billsByCategory: Record<string, Decimal> = {};
    billsRaw.forEach((bill) => {
      const category = bill.category?.name ?? othersLabel;
      billsByCategory[category] = (billsByCategory[category] ?? new Decimal(0)).plus(new Decimal(bill.amount.toString()));
    });

    const salesByPaymentMethod: Record<string, Decimal> = {};
    salesRaw.forEach((sale) => {
      const pm = sale.payment_method.name;
      salesByPaymentMethod[pm] = (salesByPaymentMethod[pm] ?? new Decimal(0)).plus(new Decimal(sale.total.toString()));
    });

    const bills = Object.entries(billsByCategory)
      .map(([category, total]) => ({category, total: total.toFixed(2)}))
      .sort((a, b) => a.category.localeCompare(b.category, "pt-BR"));

    const sales = Object.entries(salesByPaymentMethod)
      .map(([paymentMethod, total]) => ({paymentMethod, total: total.toFixed(2)}))
      .sort((a, b) => a.paymentMethod.localeCompare(b.paymentMethod, "pt-BR"));

    const totalBills = bills.reduce((acc, row) => acc.plus(new Decimal(row.total)), new Decimal(0));
    const totalSales = sales.reduce((acc, row) => acc.plus(new Decimal(row.total)), new Decimal(0));
    const balance = totalSales.minus(totalBills);

    if (!pdf) {
      return success("get", {
        bills,
        sales,
        totalBills: totalBills.toFixed(2),
        totalSales: totalSales.toFixed(2),
        balance: balance.toFixed(2),
      });
    }

    const currency = auth.tenant.currency_type;
    const period = `${moment(dateFrom).format("DD/MM/YYYY")} - ${moment(dateTo).format("DD/MM/YYYY")}`;

    const billRows = bills
      .map(
        (row) => `
      <tr>
        <td>${row.category}</td>
        <td class="right">${formatCurrency(row.total, 2, currency)}</td>
      </tr>
    `,
      )
      .join("");

    const saleRows = sales
      .map(
        (row) => `
      <tr>
        <td>${row.paymentMethod}</td>
        <td class="right">${formatCurrency(row.total, 2, currency)}</td>
      </tr>
    `,
      )
      .join("");

    const balanceColor = balance.greaterThanOrEqualTo(0) ? "#2e7d32" : "#c62828";

    const title = serverTranslate("reports.types.movement");
    const content = `
      <h2>${title}</h2>
      <p class="filter-info">${serverTranslate("reports.period")}: ${period}</p>

      <h3>${serverTranslate("reports.movement.salesTable")}</h3>
      <table style="table-layout: fixed; width: 100%">
        <colgroup><col style="width: 70%"><col style="width: 30%"></colgroup>
        <thead>
          <tr>
            <th>${serverTranslate("reports.movement.paymentMethod")}</th>
            <th class="right">${serverTranslate("global.total")}</th>
          </tr>
        </thead>
        <tbody>
          ${saleRows || `<tr><td colspan="2" class="center">${serverTranslate("global.noDataFound")}</td></tr>`}
        </tbody>
        <tfoot>
          <tr class="total-row">
            <td><strong>${serverTranslate("global.total")}</strong></td>
            <td class="right"><strong>${formatCurrency(totalSales.toFixed(2), 2, currency)}</strong></td>
          </tr>
        </tfoot>
      </table>

      <h3>${serverTranslate("reports.movement.billsTable")}</h3>
      <table style="table-layout: fixed; width: 100%">
        <colgroup><col style="width: 70%"><col style="width: 30%"></colgroup>
        <thead>
          <tr>
            <th>${serverTranslate("reports.columns.category")}</th>
            <th class="right">${serverTranslate("global.total")}</th>
          </tr>
        </thead>
        <tbody>
          ${billRows || `<tr><td colspan="2" class="center">${serverTranslate("global.noDataFound")}</td></tr>`}
        </tbody>
        <tfoot>
          <tr class="total-row">
            <td><strong>${serverTranslate("global.total")}</strong></td>
            <td class="right"><strong>${formatCurrency(totalBills.toFixed(2), 2, currency)}</strong></td>
          </tr>
        </tfoot>
      </table>

      <h3>${serverTranslate("reports.movement.balanceTable")}</h3>
      <table style="table-layout: fixed; width: 100%">
        <colgroup><col style="width: 70%"><col style="width: 30%"></colgroup>
        <tbody>
          <tr>
            <td>${serverTranslate("reports.movement.totalRevenue")}</td>
            <td class="right" style="color: #2e7d32"><strong>${formatCurrency(totalSales.toFixed(2), 2, currency)}</strong></td>
          </tr>
          <tr>
            <td>${serverTranslate("reports.movement.totalExpenses")}</td>
            <td class="right" style="color: #c62828"><strong>${formatCurrency(totalBills.toFixed(2), 2, currency)}</strong></td>
          </tr>
          <tr class="total-row">
            <td><strong>${serverTranslate("reports.movement.balance")}</strong></td>
            <td class="right" style="color: ${balanceColor}"><strong>${formatCurrency(balance.toFixed(2), 2, currency)}</strong></td>
          </tr>
        </tbody>
      </table>
    `;

    const html = generatePdfHtml({title, content, generatedAt, tenant: auth.tenant});

    log("get", {content: {dateFrom, dateTo}});

    return new NextResponse(html, {
      status: 200,
      headers: {"Content-Type": "text/html; charset=utf-8"},
    });
  });
}
