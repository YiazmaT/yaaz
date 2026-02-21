import {LogModule} from "@/src/lib/logger";
import {prisma} from "@/src/lib/prisma";
import {generatePdfHtml} from "@/src/lib/pdf-template";
import {withAuth} from "@/src/lib/route-handler";
import {formatCurrency} from "@/src/utils/format-currency";
import {serverTranslate} from "@/src/lib/server-translate";
import {NextRequest, NextResponse} from "next/server";
import moment from "moment";

const ROUTE = "/api/sale/pdf";

export async function GET(req: NextRequest) {
  return withAuth(LogModule.SALE, ROUTE, async ({auth, log, error}) => {
    const {searchParams} = new URL(req.url);
    const saleId = searchParams.get("id") || "";

    if (!saleId) {
      return error("api.errors.missingRequiredFields", 400);
    }

    const sale = await prisma.sale.findFirst({
      where: {id: saleId, tenant_id: auth.tenant_id},
      include: {
        items: {include: {product: true}},
        packages: {include: {package: true}},
        client: true,
      },
    });

    if (!sale) {
      return error("api.errors.notFound", 404, {saleId});
    }

    const t = serverTranslate;
    const currency = auth.tenant.currency_type;
    const generatedAt = new Date().toISOString();
    const title = sale.is_quote ? t("sales.quote") : t("sales.sale");

    const infoRows = `
      <tr>
        <td><strong>${t("sales.fields.date")}</strong></td>
        <td>${moment(sale.creation_date).format("DD/MM/YYYY HH:mm")}</td>
      </tr>
      ${sale.client ? `<tr><td><strong>${t("sales.fields.client")}</strong></td><td>${sale.client.name}</td></tr>` : ""}
      ${!sale.is_quote ? `<tr><td><strong>${t("sales.fields.paymentMethod")}</strong></td><td>${t(`global.${sale.payment_method}`)}</td></tr>` : ""}
    `;

    const itemRows = sale.items
      .map(
        (item) => `
      <tr>
        <td>${item.product.name}</td>
        <td class="center">${item.quantity}</td>
        <td class="right">${formatCurrency(Number(item.unit_price), 2, currency)}</td>
        <td class="right">${formatCurrency(Number(item.unit_price) * Number(item.quantity), 2, currency)}</td>
      </tr>
    `,
      )
      .join("");

    const itemsTotal = sale.items.reduce((acc, item) => acc + Number(item.unit_price) * Number(item.quantity), 0);

    let packagesSection = "";
    if (sale.packages.length > 0) {
      const packageRows = sale.packages
        .map(
          (pkg) => `
        <tr>
          <td>${pkg.package.name}</td>
          <td class="center">${pkg.quantity}</td>
        </tr>
      `,
        )
        .join("");

      packagesSection = `
        <h2 style="margin-top: 20px;">${t("global.packages")}</h2>
        <table>
          <thead>
            <tr>
              <th>${t("sales.pdf.package")}</th>
              <th class="center">${t("sales.pdf.quantity")}</th>
            </tr>
          </thead>
          <tbody>
            ${packageRows}
          </tbody>
        </table>
      `;
    }

    const content = `
      <h2>${title} #${sale.id.split("-").pop()?.toUpperCase()}</h2>
      <table>
        <tbody>
          ${infoRows}
        </tbody>
      </table>

      <h2 style="margin-top: 20px;">${t("sales.pdf.products")}</h2>
      <table>
        <thead>
          <tr>
            <th>${t("sales.pdf.product")}</th>
            <th class="center">${t("sales.pdf.quantity")}</th>
            <th class="right">${t("sales.pdf.unitPrice")}</th>
            <th class="right">${t("sales.pdf.subtotal")}</th>
          </tr>
        </thead>
        <tbody>
          ${itemRows}
        </tbody>
        <tfoot>
          <tr class="total-row">
            <td colspan="3"><strong>${t("sales.pdf.productsSubtotal")}</strong></td>
            <td class="right"><strong>${formatCurrency(itemsTotal, 2, currency)}</strong></td>
          </tr>
        </tfoot>
      </table>

      ${packagesSection}

      <table style="margin-top: 20px;">
        <tbody>
          <tr class="total-row">
            <td style="font-size: 14px;"><strong>${t("global.total")}</strong></td>
            <td class="right" style="font-size: 14px;"><strong>${formatCurrency(Number(sale.total), 2, currency)}</strong></td>
          </tr>
        </tbody>
      </table>
    `;

    const html = generatePdfHtml({title, content, generatedAt, tenant: auth.tenant, footerText: t("sales.pdf.footer")});

    log("get", {content: {html}});

    return new NextResponse(html, {
      status: 200,
      headers: {"Content-Type": "text/html; charset=utf-8"},
    });
  });
}
