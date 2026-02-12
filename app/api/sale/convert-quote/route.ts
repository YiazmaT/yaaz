import Decimal from "decimal.js";
import {LogModule} from "@/src/lib/logger";
import {prisma} from "@/src/lib/prisma";
import {withAuth} from "@/src/lib/route-handler";
import {checkStockWarnings, decrementStock} from "@/src/lib/sale-stock";
import {ConvertQuoteDto} from "@/src/pages-content/sales/dto";
import {NextRequest, NextResponse} from "next/server";

const ROUTE = "/api/sale/convert-quote";

export async function PUT(req: NextRequest) {
  return withAuth(LogModule.SALE, ROUTE, async ({auth, success, error}) => {
    const body: ConvertQuoteDto = await req.json();
    const {id, force} = body;

    if (!id) return error("api.errors.missingRequiredFields", 400);

    const existingSale = await prisma.sale.findUnique({
      where: {id, tenant_id: auth.tenant_id},
      include: {
        items: {include: {product: true}},
        packages: {include: {package: true}},
      },
    });

    if (!existingSale || !existingSale.is_quote) {
      return error("api.errors.notFound", 404, {id});
    }

    const stockItems = existingSale.items.map((item) => ({
      id: item.product.id,
      name: item.product.name,
      stock: new Decimal(item.product.stock).toNumber(),
      quantity: item.quantity,
    }));

    const packageStockItems = existingSale.packages.map((pkg) => ({
      id: pkg.package.id,
      name: pkg.package.name,
      stock: new Decimal(pkg.package.stock).toNumber(),
      quantity: pkg.quantity,
    }));

    const {stockWarnings, packageWarnings, hasWarnings} = checkStockWarnings(stockItems, packageStockItems);
    if (hasWarnings && !force) {
      return success("create", {success: false, stockWarnings, packageWarnings});
    }

    const sale = await prisma.$transaction(async (tx) => {
      const updatedSale = await tx.sale.update({
        where: {id},
        data: {
          is_quote: false,
          last_edit_date: new Date(),
          last_editor_id: auth.user.id,
        },
        include: {
          items: {include: {product: true}},
          packages: {include: {package: true}},
        },
      });

      await decrementStock(
        tx,
        existingSale.items.map((i) => ({id: i.product_id, quantity: i.quantity})),
        existingSale.packages.map((p) => ({id: p.package_id, quantity: p.quantity})),
      );

      return updatedSale;
    });

    return success("update", sale, {before: existingSale, after: sale});
  });
}
