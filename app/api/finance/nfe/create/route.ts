import Decimal from "decimal.js";
import {LogModule} from "@/src/lib/logger";
import {buildNfeStockOps} from "@/src/lib/nfe-stock";
import {prisma} from "@/src/lib/prisma";
import {withAuth} from "@/src/lib/route-handler";
import {NextRequest} from "next/server";
import {NfeItemPayload} from "@/src/pages-content/finance/nfe/dto";

const ROUTE = "/api/finance/nfe/create";

export async function POST(req: NextRequest) {
  return withAuth(LogModule.NFE, ROUTE, async ({auth, success, error}) => {
    const {description, supplier, nfeNumber, date, items, createBill, addToStock, fileUrl} = await req.json();

    if (!description || !nfeNumber || !date || !items || !Array.isArray(items) || items.length === 0) {
      return error("api.errors.missingRequiredFields", 400);
    }

    const totalAmount = items.reduce((sum: Decimal, item: NfeItemPayload) => {
      return sum.plus(new Decimal(item.quantity).times(new Decimal(item.unitPrice)));
    }, new Decimal(0));

    let productStockMap: Map<string, string> = new Map();
    if (addToStock) {
      const productIds = items.filter((i) => i.itemType === "product").map((i) => i.itemId);
      if (productIds.length > 0) {
        const products = await prisma.product.findMany({
          where: {id: {in: productIds}, tenant_id: auth.tenant_id},
          select: {id: true, stock: true},
        });
        for (const p of products) {
          productStockMap.set(p.id, String(p.stock));
        }
      }
    }

    const [maxNfeCode, maxBillCode] = await Promise.all([
      prisma.nfe.aggregate({where: {tenant_id: auth.tenant_id}, _max: {code: true}}),
      createBill ? prisma.bill.aggregate({where: {tenant_id: auth.tenant_id}, _max: {code: true}}) : Promise.resolve(null),
    ]);

    const nextCode = (maxNfeCode._max.code || 0) + 1;
    const nextBillCode = createBill ? (maxBillCode!._max.code || 0) + 1 : null;

    const nfeItemsData = items.map((item: NfeItemPayload) => {
      const itemTotal = new Decimal(item.quantity).times(new Decimal(item.unitPrice));
      return {
        tenant_id: auth.tenant_id,
        item_type: item.itemType,
        ingredient_id: item.itemType === "ingredient" ? item.itemId : null,
        product_id: item.itemType === "product" ? item.itemId : null,
        package_id: item.itemType === "package" ? item.itemId : null,
        quantity: item.quantity.toString(),
        unit_price: item.unitPrice.toString(),
        total_price: itemTotal.toDecimalPlaces(2).toString(),
      };
    });

    const ops: any[] = [
      prisma.nfe.create({
        data: {
          tenant_id: auth.tenant_id,
          code: nextCode,
          description,
          supplier: supplier || null,
          nfe_number: nfeNumber,
          date: new Date(date),
          total_amount: totalAmount.toDecimalPlaces(2).toString(),
          file_url: fileUrl,
          stock_added: addToStock ? true : false,
          creator_id: auth.user.id,
          items: {create: nfeItemsData},
        },
        include: {items: true},
      }),
    ];

    if (createBill && nextBillCode !== null) {
      ops.push(
        prisma.bill.create({
          data: {
            tenant_id: auth.tenant_id,
            code: nextBillCode,
            description: `NFE (#${nextCode})`,
            amount: totalAmount.toDecimalPlaces(2).toString(),
            due_date: new Date(date),
            creator_id: auth.user.id,
          },
        }),
      );
    }

    if (addToStock) {
      const stockItems = items.map((item: NfeItemPayload) => ({
        item_type: item.itemType,
        ingredient_id: item.itemType === "ingredient" ? item.itemId : null,
        product_id: item.itemType === "product" ? item.itemId : null,
        package_id: item.itemType === "package" ? item.itemId : null,
        quantity: item.quantity,
        total_price: new Decimal(item.quantity).times(new Decimal(item.unitPrice)).toDecimalPlaces(2).toString(),
        product: item.itemType === "product" ? {stock: productStockMap.get(item.itemId) ?? "0"} : null,
      }));
      ops.push(...buildNfeStockOps(stockItems, auth.tenant_id, auth.user.id, nextCode));
    }

    const [nfe] = await prisma.$transaction(ops);

    return success("create", nfe);
  });
}
