import Decimal from "decimal.js";
import {calculateApproximateCost} from "@/src/lib/calculate-sale-cost";
import {LogModule} from "@/src/lib/logger";
import {prisma} from "@/src/lib/prisma";
import {withAuth} from "@/src/lib/route-handler";
import {serverTranslate} from "@/src/lib/server-translate";
import {UpdateSaleDto, ProductStockWarning, PackageStockWarning, PriceChangeWarning} from "@/src/pages-content/sales/dto";
import {NextRequest} from "next/server";

const ROUTE = "/api/sale/update";

export async function PUT(req: NextRequest) {
  return withAuth(LogModule.SALE, ROUTE, async ({auth, success, error}) => {
    const body: UpdateSaleDto = await req.json();
    const {id, payment_method_id, total, items, packages, force, updatePrices, client_id, discount_percent, discount_value, discount_computed} = body;

    const hasItems = items && items.length > 0;
    const hasPackages = packages && packages.length > 0;

    if (!id || !payment_method_id || total === undefined || (!hasItems && !hasPackages)) {
      return error("api.errors.missingRequiredFields", 400);
    }

    const paymentMethod = await prisma.financePaymentMethod.findUnique({
      where: {id: payment_method_id, tenant_id: auth.tenant_id},
    });
    if (!paymentMethod) return error("api.errors.notFound", 404, {payment_method_id});

    const existingSale = await prisma.sale.findUnique({
      where: {id, tenant_id: auth.tenant_id},
      include: {
        items: {include: {product: true}},
        packages: {include: {package: true}},
        payment_method: {select: {bank_account_id: true}},
        bank_transaction: {select: {id: true, bank_account_id: true, amount: true}},
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
    let finalDiscountComputed = discount_computed ? new Decimal(discount_computed) : new Decimal(0);

    if (updatePrices && hasItems) {
      const newSubtotal = items.reduce((acc, item) => {
        const price = productsMap.get(item.product_id)?.price || item.unit_price;
        return acc.plus(new Decimal(price).times(item.quantity));
      }, new Decimal(0));

      const dPercent = discount_percent ? new Decimal(discount_percent) : new Decimal(0);
      const dValue = discount_value ? new Decimal(discount_value) : new Decimal(0);

      if (dPercent.greaterThan(0)) {
        finalDiscountComputed = newSubtotal.times(dPercent).dividedBy(100);
      } else if (dValue.greaterThan(0)) {
        finalDiscountComputed = dValue;
      }

      finalTotal = Decimal.max(0, newSubtotal.minus(finalDiscountComputed)).toString();
    }

    const sale = await prisma.$transaction(async (tx) => {
      await tx.saleItem.deleteMany({where: {sale_id: id, tenant_id: auth.tenant_id}});
      await tx.salePackage.deleteMany({where: {sale_id: id, tenant_id: auth.tenant_id}});

      const updatedSale = await tx.sale.update({
        where: {id, tenant_id: auth.tenant_id},
        data: {
          payment_method_id,
          total: finalTotal,
          approximate_cost: approximateCost,
          client_id: client_id || null,
          last_edit_date: new Date(),
          last_editor_id: auth.user.id,
          discount_percent: discount_percent ? new Decimal(discount_percent) : null,
          discount_value: discount_value ? new Decimal(discount_value) : null,
          discount_computed: finalDiscountComputed.isZero() ? null : finalDiscountComputed,
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
            where: {id: change.productId, tenant_id: auth.tenant_id},
            data: {stock: {increment: change.change}},
          });
        } else if (change.change < 0) {
          await tx.product.update({
            where: {id: change.productId, tenant_id: auth.tenant_id},
            data: {stock: {decrement: Math.abs(change.change)}},
          });
        }
      }

      for (const change of packageStockChanges) {
        if (change.change > 0) {
          await tx.package.update({
            where: {id: change.packageId, tenant_id: auth.tenant_id},
            data: {stock: {increment: change.change}},
          });
        } else if (change.change < 0) {
          await tx.package.update({
            where: {id: change.packageId, tenant_id: auth.tenant_id},
            data: {stock: {decrement: Math.abs(change.change)}},
          });
        }
      }

      if (!existingSale.is_quote) {
        const oldBankAccountId = existingSale.payment_method.bank_account_id;
        const newBankAccountId = paymentMethod.bank_account_id;
        const existingTx = existingSale.bank_transaction;

        if (oldBankAccountId === newBankAccountId && newBankAccountId !== null) {
          if (existingTx) {
            const diff = new Decimal(finalTotal).minus(existingTx.amount.toString());
            if (!diff.isZero()) {
              await tx.bankTransaction.update({
                where: {id: existingTx.id, tenant_id: auth.tenant_id},
                data: {amount: new Decimal(finalTotal)},
              });
              if (diff.greaterThan(0)) {
                await tx.bankAccount.update({where: {id: newBankAccountId, tenant_id: auth.tenant_id}, data: {balance: {increment: diff}}});
              } else {
                await tx.bankAccount.update({where: {id: newBankAccountId, tenant_id: auth.tenant_id}, data: {balance: {decrement: diff.abs()}}});
              }
            }
          }
        } else {
          if (existingTx) {
            await tx.bankTransaction.delete({where: {id: existingTx.id, tenant_id: auth.tenant_id}});
            await tx.bankAccount.update({
              where: {id: existingTx.bank_account_id, tenant_id: auth.tenant_id},
              data: {balance: {decrement: existingTx.amount}},
            });
          }

          if (newBankAccountId) {
            const saleCode = id.split("-").pop()?.toUpperCase();
            await tx.bankTransaction.create({
              data: {
                tenant_id: auth.tenant_id,
                bank_account_id: newBankAccountId,
                type: "deposit",
                amount: new Decimal(finalTotal),
                description: `${serverTranslate("sales.bankStatement.description")} #${saleCode}`,
                date: new Date(),
                sale_id: id,
                creator_id: auth.user.id,
              },
            });
            await tx.bankAccount.update({
              where: {id: newBankAccountId, tenant_id: auth.tenant_id},
              data: {balance: {increment: new Decimal(finalTotal)}},
            });
          }
        }
      }

      return updatedSale;
    });

    return success("update", sale, {before: existingSale, after: sale});
  });
}
