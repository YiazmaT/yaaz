import Decimal from "decimal.js";
import {calculateApproximateCost} from "@/src/lib/calculate-sale-cost";
import {LogModule} from "@/src/lib/logger";
import {prisma} from "@/src/lib/prisma";
import {withAuth} from "@/src/lib/route-handler";
import {checkStockWarnings, decrementStock} from "@/src/lib/sale-stock";
import {serverTranslate} from "@/src/lib/server-translate";
import {CreateSaleDto} from "@/src/pages-content/sales/dto";
import {NextRequest} from "next/server";

const ROUTE = "/api/sale/create";

export async function POST(req: NextRequest) {
  return withAuth(LogModule.SALE, ROUTE, async ({auth, success, error}) => {
    const body: CreateSaleDto = await req.json();
    const {payment_method_id, total, items, packages, force, is_quote, client_id, discount_percent, discount_value, discount_computed} = body;

    const hasItems = items && items.length > 0;
    const hasPackages = packages && packages.length > 0;

    if (!payment_method_id || total === undefined || (!hasItems && !hasPackages)) {
      return error("api.errors.missingRequiredFields", 400);
    }

    const paymentMethod = await prisma.financePaymentMethod.findUnique({
      where: {id: payment_method_id, tenant_id: auth.tenant_id},
    });
    if (!paymentMethod) return error("api.errors.notFound", 404, {payment_method_id});

    const productsMap = new Map<string, {id: string; name: string; stock: number; price: string}>();

    if (hasItems) {
      const productIds = items.map((item) => item.product_id);
      const products = await prisma.product.findMany({
        where: {id: {in: productIds}, tenant_id: auth.tenant_id},
        select: {id: true, name: true, stock: true, price: true},
      });

      for (const product of products) {
        productsMap.set(product.id, {
          id: product.id,
          name: product.name,
          stock: Number(product.stock),
          price: product.price.toString(),
        });
      }
    }

    if (!is_quote) {
      const stockItems = items
        .filter((i) => productsMap.has(i.product_id))
        .map((i) => {
          const p = productsMap.get(i.product_id)!;
          return {id: p.id, name: p.name, stock: p.stock, quantity: Number(i.quantity)};
        });

      let packageStockItems: {id: string; name: string; stock: number; quantity: number}[] = [];
      if (hasPackages) {
        const packageIds = packages.map((pkg) => pkg.package_id);
        const dbPackages = await prisma.package.findMany({
          where: {id: {in: packageIds}, tenant_id: auth.tenant_id},
          select: {id: true, name: true, stock: true},
        });
        packageStockItems = packages
          .map((pkg) => {
            const dbPkg = dbPackages.find((p) => p.id === pkg.package_id);
            return dbPkg ? {id: dbPkg.id, name: dbPkg.name, stock: new Decimal(dbPkg.stock).toNumber(), quantity: Number(pkg.quantity)} : null;
          })
          .filter((x): x is NonNullable<typeof x> => x !== null);
      }

      const {stockWarnings, packageWarnings, hasWarnings} = checkStockWarnings(stockItems, packageStockItems);
      if (hasWarnings && !force) {
        return success("create", {success: false, stockWarnings, packageWarnings});
      }
    }

    const approximateCost = await calculateApproximateCost(items || [], packages || [], auth.tenant_id);

    const sale = await prisma.$transaction(async (tx) => {
      const newSale = await tx.sale.create({
        data: {
          tenant_id: auth.tenant_id,
          payment_method_id,
          total,
          approximate_cost: approximateCost,
          is_quote: is_quote || false,
          client_id: client_id || null,
          creator_id: auth.user.id,
          discount_percent: discount_percent ? new Decimal(discount_percent) : null,
          discount_value: discount_value ? new Decimal(discount_value) : null,
          discount_computed: discount_computed ? new Decimal(discount_computed) : null,
          items: hasItems
            ? {
                create: items.map((item) => ({
                  tenant_id: auth.tenant_id,
                  product_id: item.product_id,
                  quantity: item.quantity,
                  unit_price: productsMap.get(item.product_id)?.price || "0",
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

      if (!is_quote) {
        await decrementStock(
          tx,
          hasItems ? items.map((i) => ({id: i.product_id, quantity: Number(i.quantity)})) : [],
          hasPackages ? packages.map((p) => ({id: p.package_id, quantity: Number(p.quantity)})) : [],
          auth.tenant_id,
        );

        if (paymentMethod.bank_account_id) {
          const saleCode = newSale.id.split("-").pop()?.toUpperCase();
          await tx.bankTransaction.create({
            data: {
              tenant_id: auth.tenant_id,
              bank_account_id: paymentMethod.bank_account_id,
              type: "deposit",
              amount: new Decimal(total),
              description: `${serverTranslate("sales.bankStatement.description")} #${saleCode}`,
              date: new Date(),
              sale_id: newSale.id,
              creator_id: auth.user.id,
            },
          });
          await tx.bankAccount.update({
            where: {id: paymentMethod.bank_account_id, tenant_id: auth.tenant_id},
            data: {balance: {increment: new Decimal(total)}},
          });
        }
      }

      return newSale;
    });

    return success("create", sale);
  });
}
