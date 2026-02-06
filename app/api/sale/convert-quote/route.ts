import Decimal from "decimal.js";
import {authenticateRequest} from "@/src/lib/auth";
import {logCritical, logError, LogModule, LogSource, logUpdate} from "@/src/lib/logger";
import {prisma} from "@/src/lib/prisma";
import {checkStockWarnings, decrementStock} from "@/src/lib/sale-stock";
import {ConvertQuoteDto} from "@/src/pages-content/sales/dto";
import {NextRequest, NextResponse} from "next/server";

const ROUTE = "/api/sale/convert-quote";

export async function PUT(req: NextRequest) {
  const auth = await authenticateRequest(LogModule.SALE, ROUTE);
  if (auth.error) return auth.error;

  try {
    const body: ConvertQuoteDto = await req.json();
    const {id, force} = body;

    if (!id) {
      logError({
        module: LogModule.SALE,
        source: LogSource.API,
        message: "api.errors.missingRequiredFields",
        route: ROUTE,
        userId: auth.user!.id,
        tenantId: auth.tenant_id,
      });
      return NextResponse.json({error: "api.errors.missingRequiredFields"}, {status: 400});
    }

    const existingSale = await prisma.sale.findUnique({
      where: {id, tenant_id: auth.tenant_id},
      include: {
        items: {include: {product: true}},
        packages: {include: {package: true}},
      },
    });

    if (!existingSale || !existingSale.is_quote) {
      logError({
        module: LogModule.SALE,
        source: LogSource.API,
        message: "Sale not found",
        content: {id},
        route: ROUTE,
        userId: auth.user!.id,
        tenantId: auth.tenant_id,
      });
      return NextResponse.json({error: "api.errors.dataNotFound"}, {status: 404});
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
      return NextResponse.json({success: false, stockWarnings, packageWarnings}, {status: 200});
    }

    const sale = await prisma.$transaction(async (tx) => {
      const updatedSale = await tx.sale.update({
        where: {id},
        data: {
          is_quote: false,
          last_edit_date: new Date(),
          last_editor_id: auth.user!.id,
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

    logUpdate({
      module: LogModule.SALE,
      source: LogSource.API,
      content: {before: existingSale, after: sale},
      route: ROUTE,
      userId: auth.user!.id,
      tenantId: auth.tenant_id,
    });

    return NextResponse.json({success: true, sale}, {status: 200});
  } catch (error) {
    await logCritical({module: LogModule.SALE, source: LogSource.API, error, route: ROUTE, userId: auth.user!.id, tenantId: auth.tenant_id});
    return NextResponse.json({error: "api.errors.somethingWentWrong"}, {status: 500});
  }
}
