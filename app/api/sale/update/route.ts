import Decimal from "decimal.js";
import {authenticateRequest} from "@/src/lib/auth";
import {calculateApproximateCost} from "@/src/lib/calculate-sale-cost";
import {logCritical, logError, LogModule, LogSource, logUpdate} from "@/src/lib/logger";
import {prisma} from "@/src/lib/prisma";
import {UpdateSaleDto, ProductStockWarning, PackageStockWarning} from "@/src/pages-content/sales/dto";
import {NextRequest, NextResponse} from "next/server";

const ROUTE = "/api/sale/update";

export async function PUT(req: NextRequest) {
  const auth = await authenticateRequest(LogModule.SALE, ROUTE);
  if (auth.error) return auth.error;

  try {
    const body: UpdateSaleDto = await req.json();
    const {id, payment_method, total, items, packages, force} = body;

    const hasItems = items && items.length > 0;
    const hasPackages = packages && packages.length > 0;

    if (!id || !payment_method || total === undefined || (!hasItems && !hasPackages)) {
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

    if (!existingSale) {
      logError({
        module: LogModule.SALE,
        source: LogSource.API,
        message: "Sale not found",
        content: {id},
        route: ROUTE,
        userId: auth.user!.id,
        tenantId: auth.tenant_id,
      });
      return NextResponse.json({error: "api.errors.somethingWentWrong"}, {status: 404});
    }

    const oldItemsMap = new Map<string, number>();
    for (const item of existingSale.items) {
      oldItemsMap.set(item.product_id, item.quantity);
    }

    const oldPackagesMap = new Map<string, number>();
    for (const pkg of existingSale.packages) {
      oldPackagesMap.set(pkg.package_id, pkg.quantity);
    }

    const productStockChanges: {productId: string; change: number}[] = [];
    const packageStockChanges: {packageId: string; change: number}[] = [];

    if (hasItems) {
      for (const item of items) {
        const oldQty = oldItemsMap.get(item.product_id) || 0;
        const newQty = item.quantity;
        const change = oldQty - newQty;
        if (change !== 0) {
          productStockChanges.push({productId: item.product_id, change});
        }
        oldItemsMap.delete(item.product_id);
      }
    }

    for (const [productId, oldQty] of oldItemsMap) {
      productStockChanges.push({productId, change: oldQty});
    }

    if (hasPackages) {
      for (const pkg of packages) {
        const oldQty = oldPackagesMap.get(pkg.package_id) || 0;
        const newQty = pkg.quantity;
        const change = oldQty - newQty;
        if (change !== 0) {
          packageStockChanges.push({packageId: pkg.package_id, change});
        }
        oldPackagesMap.delete(pkg.package_id);
      }
    }

    for (const [packageId, oldQty] of oldPackagesMap) {
      packageStockChanges.push({packageId, change: oldQty});
    }

    const stockWarnings: ProductStockWarning[] = [];
    const packageWarnings: PackageStockWarning[] = [];

    const productIdsToCheck = productStockChanges.filter((p) => p.change < 0).map((p) => p.productId);
    if (productIdsToCheck.length > 0) {
      const products = await prisma.product.findMany({
        where: {id: {in: productIdsToCheck}, tenant_id: auth.tenant_id},
        select: {id: true, name: true, stock: true},
      });

      for (const change of productStockChanges) {
        if (change.change < 0) {
          const product = products.find((p) => p.id === change.productId);
          if (product) {
            const currentStock = new Decimal(product.stock);
            const resultingStock = currentStock.plus(change.change);
            if (resultingStock.lessThan(0)) {
              stockWarnings.push({
                productId: product.id,
                productName: product.name,
                currentStock: currentStock.toNumber(),
                requestedQuantity: Math.abs(change.change),
                resultingStock: resultingStock.toNumber(),
              });
            }
          }
        }
      }
    }

    const packageIdsToCheck = packageStockChanges.filter((p) => p.change < 0).map((p) => p.packageId);
    if (packageIdsToCheck.length > 0) {
      const dbPackages = await prisma.package.findMany({
        where: {id: {in: packageIdsToCheck}, tenant_id: auth.tenant_id},
        select: {id: true, name: true, stock: true},
      });

      for (const change of packageStockChanges) {
        if (change.change < 0) {
          const pkg = dbPackages.find((p) => p.id === change.packageId);
          if (pkg) {
            const currentStock = new Decimal(pkg.stock);
            const resultingStock = currentStock.plus(change.change);
            if (resultingStock.lessThan(0)) {
              packageWarnings.push({
                packageId: pkg.id,
                packageName: pkg.name,
                currentStock: currentStock.toNumber(),
                requestedQuantity: Math.abs(change.change),
                resultingStock: resultingStock.toNumber(),
              });
            }
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
      await tx.saleItem.deleteMany({where: {sale_id: id}});
      await tx.salePackage.deleteMany({where: {sale_id: id}});

      const updatedSale = await tx.sale.update({
        where: {id},
        data: {
          payment_method: payment_method as any,
          total,
          approximate_cost: approximateCost,
          last_edit_date: new Date(),
          last_editor_id: auth.user!.id,
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
          items: {include: {product: true}},
          packages: {include: {package: true}},
        },
      });

      for (const change of productStockChanges) {
        if (change.change > 0) {
          await tx.product.update({
            where: {id: change.productId},
            data: {stock: {increment: change.change}},
          });
        } else if (change.change < 0) {
          await tx.product.update({
            where: {id: change.productId},
            data: {stock: {decrement: Math.abs(change.change)}},
          });
        }
      }

      for (const change of packageStockChanges) {
        if (change.change > 0) {
          await tx.package.update({
            where: {id: change.packageId},
            data: {stock: {increment: change.change}},
          });
        } else if (change.change < 0) {
          await tx.package.update({
            where: {id: change.packageId},
            data: {stock: {decrement: Math.abs(change.change)}},
          });
        }
      }

      return updatedSale;
    });

    logUpdate({module: LogModule.SALE, source: LogSource.API, content: {before: existingSale, after: sale}, route: ROUTE, userId: auth.user!.id, tenantId: auth.tenant_id});

    return NextResponse.json({success: true, sale}, {status: 200});
  } catch (error) {
    await logCritical({module: LogModule.SALE, source: LogSource.API, error, route: ROUTE, userId: auth.user!.id, tenantId: auth.tenant_id});
    return NextResponse.json({error: "api.errors.somethingWentWrong"}, {status: 500});
  }
}
