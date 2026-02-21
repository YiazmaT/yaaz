import Decimal from "decimal.js";
import {calculateApproximateCost} from "@/src/lib/calculate-sale-cost";
import {LogModule} from "@/src/lib/logger";
import {prisma} from "@/src/lib/prisma";
import {withAuth} from "@/src/lib/route-handler";
import {UpdateSaleDto, ProductStockWarning, PackageStockWarning, PriceChangeWarning} from "@/src/pages-content/sales/dto";
import {NextRequest, NextResponse} from "next/server";

const ROUTE = "/api/sale/update";

export async function PUT(req: NextRequest) {
  return withAuth(LogModule.SALE, ROUTE, async ({auth, success, error}) => {
    const body: UpdateSaleDto = await req.json();
    const {id, payment_method, total, items, packages, force, updatePrices, client_id} = body;

    const hasItems = items && items.length > 0;
    const hasPackages = packages && packages.length > 0;

    if (!id || !payment_method || total === undefined || (!hasItems && !hasPackages)) {
      return error("api.errors.missingRequiredFields", 400);
    }

    const existingSale = await prisma.sale.findUnique({
      where: {id, tenant_id: auth.tenant_id},
      include: {
        items: {include: {product: true}},
        packages: {include: {package: true}},
      },
    });

    if (!existingSale) {
      return error("api.errors.notFound", 404, {id});
    }

    const oldItemsMap = new Map<string, number>();
    for (const item of existingSale.items) {
      oldItemsMap.set(item.product_id, Number(item.quantity));
    }

    const oldPackagesMap = new Map<string, number>();
    for (const pkg of existingSale.packages) {
      oldPackagesMap.set(pkg.package_id, Number(pkg.quantity));
    }

    const productStockChanges: {productId: string; change: number}[] = [];
    const packageStockChanges: {packageId: string; change: number}[] = [];

    if (hasItems) {
      for (const item of items) {
        const oldQty = oldItemsMap.get(item.product_id) || 0;
        const newQty = Number(item.quantity);
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
        const newQty = Number(pkg.quantity);
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
    const priceChangeWarnings: PriceChangeWarning[] = [];

    const productsMap = new Map<string, {id: string; name: string; price: string}>();
    if (hasItems) {
      const productIds = items.map((item) => item.product_id);
      const products = await prisma.product.findMany({
        where: {id: {in: productIds}, tenant_id: auth.tenant_id},
        select: {id: true, name: true, price: true},
      });
      for (const product of products) {
        productsMap.set(product.id, {id: product.id, name: product.name, price: product.price.toString()});
      }

      for (const item of items) {
        const product = productsMap.get(item.product_id);
        if (product && item.unit_price !== product.price) {
          priceChangeWarnings.push({
            productId: product.id,
            productName: product.name,
            originalPrice: item.unit_price,
            currentPrice: product.price,
          });
        }
      }

      if (priceChangeWarnings.length > 0 && updatePrices === undefined) {
        return success("update", {success: false, priceChangeWarnings});
      }
    }

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
      return success("update", {success: false, stockWarnings, packageWarnings});
    }

    const approximateCost = await calculateApproximateCost(items || [], packages || [], auth.tenant_id);

    let finalTotal = total;
    if (updatePrices && hasItems) {
      finalTotal = items
        .reduce((acc, item) => {
          const price = productsMap.get(item.product_id)?.price || item.unit_price;
          return acc.plus(new Decimal(price).times(item.quantity));
        }, new Decimal(0))
        .toString();
    }

    const sale = await prisma.$transaction(async (tx) => {
      await tx.saleItem.deleteMany({where: {sale_id: id}});
      await tx.salePackage.deleteMany({where: {sale_id: id}});

      const updatedSale = await tx.sale.update({
        where: {id},
        data: {
          payment_method: payment_method as any,
          total: finalTotal,
          approximate_cost: approximateCost,
          client_id: client_id || null,
          last_edit_date: new Date(),
          last_editor_id: auth.user.id,
          items: hasItems
            ? {
                create: items.map((item) => ({
                  tenant_id: auth.tenant_id,
                  product_id: item.product_id,
                  quantity: item.quantity,
                  unit_price: updatePrices ? productsMap.get(item.product_id)?.price || item.unit_price : item.unit_price,
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

    return success("update", sale, {before: existingSale, after: sale});
  });
}
