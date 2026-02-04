import Decimal from "decimal.js";
import {authenticateRequest} from "@/src/lib/auth";
import {calculateApproximateCost} from "@/src/lib/calculate-sale-cost";
import {notifyNewSale} from "@/src/lib/discord";
import {logCritical, logError, LogModule, LogSource, logCreate} from "@/src/lib/logger";
import {prisma} from "@/src/lib/prisma";
import {CreateSaleDto, ProductStockWarning, PackageStockWarning} from "@/src/pages-content/sales/dto";
import {NextRequest, NextResponse} from "next/server";

const ROUTE = "/api/sale/create";

export async function POST(req: NextRequest) {
  const auth = await authenticateRequest(LogModule.SALE, ROUTE);
  if (auth.error) return auth.error;

  try {
    const body: CreateSaleDto = await req.json();
    const {payment_method, total, items, packages, force} = body;

    const hasItems = items && items.length > 0;
    const hasPackages = packages && packages.length > 0;

    if (!payment_method || total === undefined || (!hasItems && !hasPackages)) {
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

    const stockWarnings: ProductStockWarning[] = [];
    const packageWarnings: PackageStockWarning[] = [];

    if (hasItems) {
      const productIds = items.map((item) => item.product_id);
      const products = await prisma.product.findMany({
        where: {id: {in: productIds}, tenant_id: auth.tenant_id},
        select: {id: true, name: true, stock: true},
      });

      for (const item of items) {
        const product = products.find((p) => p.id === item.product_id);
        if (product) {
          const currentStock = new Decimal(product.stock);
          const resultingStock = currentStock.minus(item.quantity);
          if (resultingStock.lessThan(0)) {
            stockWarnings.push({
              productId: product.id,
              productName: product.name,
              currentStock: currentStock.toNumber(),
              requestedQuantity: item.quantity,
              resultingStock: resultingStock.toNumber(),
            });
          }
        }
      }
    }

    if (hasPackages) {
      const packageIds = packages.map((pkg) => pkg.package_id);
      const dbPackages = await prisma.package.findMany({
        where: {id: {in: packageIds}, tenant_id: auth.tenant_id},
        select: {id: true, name: true, stock: true},
      });

      for (const pkg of packages) {
        const dbPackage = dbPackages.find((p) => p.id === pkg.package_id);
        if (dbPackage) {
          const currentStock = new Decimal(dbPackage.stock);
          const resultingStock = currentStock.minus(pkg.quantity);
          if (resultingStock.lessThan(0)) {
            packageWarnings.push({
              packageId: dbPackage.id,
              packageName: dbPackage.name,
              currentStock: currentStock.toNumber(),
              requestedQuantity: pkg.quantity,
              resultingStock: resultingStock.toNumber(),
            });
          }
        }
      }
    }

    const hasWarnings = stockWarnings.length > 0 || packageWarnings.length > 0;
    if (hasWarnings && !force) {
      return NextResponse.json({success: false, stockWarnings, packageWarnings}, {status: 200});
    }

    const approximateCost = await calculateApproximateCost(items || [], packages || [], auth.tenant_id);

    const sale = await prisma.$transaction(async (tx) => {
      const newSale = await tx.sale.create({
        data: {
          tenant_id: auth.tenant_id,
          payment_method: payment_method as any,
          total,
          approximate_cost: approximateCost,
          creator_id: auth.user!.id,
          items: hasItems
            ? {
                create: items.map((item) => ({
                  tenant_id: auth.tenant_id,
                  product_id: item.product_id,
                  quantity: item.quantity,
                })),
              }
            : undefined,
          packages: hasPackages
            ? {
                create: packages.map((pkg) => ({
                  tenant_id: auth.tenant_id,
                  package_id: pkg.package_id,
                  quantity: pkg.quantity,
                })),
              }
            : undefined,
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
          packages: {
            include: {
              package: true,
            },
          },
        },
      });

      if (hasItems) {
        for (const item of items) {
          await tx.product.update({
            where: {id: item.product_id},
            data: {stock: {decrement: item.quantity}},
          });
        }
      }

      if (hasPackages) {
        for (const pkg of packages) {
          await tx.package.update({
            where: {id: pkg.package_id},
            data: {stock: {decrement: pkg.quantity}},
          });
        }
      }

      return newSale;
    });

    const paymentMethodLabels: Record<string, string> = {
      credit: "Crédito",
      debit: "Débito",
      pix: "Pix",
      cash: "Dinheiro",
      iFood: "iFood",
    };

    notifyNewSale({
      total: Number(sale.total),
      items: sale.items.map((item) => ({
        product: {name: item.product.name, price: String(item.product.price)},
        quantity: item.quantity,
      })),
      packages: sale.packages.map((pkg) => ({
        package: {name: pkg.package.name},
        quantity: pkg.quantity,
      })),
      paymentMethod: paymentMethodLabels[payment_method] || payment_method,
    });

    logCreate({module: LogModule.SALE, source: LogSource.API, content: sale, route: ROUTE, userId: auth.user!.id, tenantId: auth.tenant_id});

    return NextResponse.json({success: true, sale}, {status: 200});
  } catch (error) {
    await logCritical({module: LogModule.SALE, source: LogSource.API, error, route: ROUTE, userId: auth.user!.id, tenantId: auth.tenant_id});
    return NextResponse.json({error: "api.errors.somethingWentWrong"}, {status: 500});
  }
}
