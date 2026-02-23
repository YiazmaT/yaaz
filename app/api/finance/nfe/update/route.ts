import Decimal from "decimal.js";
import {LogModule} from "@/src/lib/logger";
import {prisma} from "@/src/lib/prisma";
import {withAuth} from "@/src/lib/route-handler";
import {NextRequest} from "next/server";
import {NfeItemPayload, NfeUpdatePayload} from "@/src/pages-content/finance/nfe/dto";

const ROUTE = "/api/finance/nfe/update";

export async function PUT(req: NextRequest) {
  return withAuth(LogModule.NFE, ROUTE, async ({auth, success, error}) => {
    const {id, description, supplier, nfeNumber, date, items}: NfeUpdatePayload = await req.json();

    if (!id || !description || !nfeNumber || !date || !items || !Array.isArray(items) || items.length === 0) {
      return error("api.errors.missingRequiredFields", 400);
    }

    const existing = await prisma.nfe.findUnique({
      where: {id, tenant_id: auth.tenant_id},
      include: {items: true},
    });
    if (!existing) return error("api.errors.notFound", 404, {id});

    const totalAmount = items.reduce((sum: Decimal, item: NfeItemPayload) => {
      return sum.plus(new Decimal(item.quantity).times(new Decimal(item.unitPrice)));
    }, new Decimal(0));

    const oldItemsMap = new Map(
      existing.items.map((item) => [buildItemKey(item.item_type, item.ingredient_id || item.product_id || item.package_id || ""), item]),
    );

    const newItemsMap = new Map(items.map((item) => [buildItemKey(item.itemType, item.itemId), item]));

    const ops = [];

    for (const [key, oldItem] of oldItemsMap) {
      const newItem = newItemsMap.get(key);

      if (!newItem) {
        ops.push(prisma.nfeItem.delete({where: {id: oldItem.id, tenant_id: auth.tenant_id}}));
        continue;
      }

      const newQty = new Decimal(newItem.quantity);
      const newPrice = new Decimal(newItem.unitPrice);
      const newTotal = newQty.times(newPrice);

      ops.push(
        prisma.nfeItem.update({
          where: {id: oldItem.id, tenant_id: auth.tenant_id},
          data: {
            quantity: newQty.toString(),
            unit_price: newPrice.toString(),
            total_price: newTotal.toDecimalPlaces(2).toString(),
          },
        }),
      );
    }

    for (const [key, newItem] of newItemsMap) {
      if (oldItemsMap.has(key)) continue;

      const newQty = new Decimal(newItem.quantity);
      const newPrice = new Decimal(newItem.unitPrice);
      const newTotal = newQty.times(newPrice);

      ops.push(
        prisma.nfeItem.create({
          data: {
            tenant_id: auth.tenant_id,
            nfe_id: id,
            item_type: newItem.itemType,
            ingredient_id: newItem.itemType === "ingredient" ? newItem.itemId : null,
            product_id: newItem.itemType === "product" ? newItem.itemId : null,
            package_id: newItem.itemType === "package" ? newItem.itemId : null,
            quantity: newQty.toString(),
            unit_price: newPrice.toString(),
            total_price: newTotal.toDecimalPlaces(2).toString(),
          },
        }),
      );
    }

    ops.push(
      prisma.nfe.update({
        where: {id, tenant_id: auth.tenant_id},
        data: {
          description,
          supplier: supplier || null,
          nfe_number: nfeNumber,
          date: new Date(date),
          total_amount: totalAmount.toDecimalPlaces(2).toString(),
          last_edit_date: new Date(),
          last_editor_id: auth.user.id,
        },
      }),
    );

    await prisma.$transaction(ops);

    const nfe = await prisma.nfe.findUnique({
      where: {id, tenant_id: auth.tenant_id},
      include: {items: true},
    });

    return success("update", nfe);
  });
}

function buildItemKey(type: string, id: string) {
  return `${type}:${id}`;
}
