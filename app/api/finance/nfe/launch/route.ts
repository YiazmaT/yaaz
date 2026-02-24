import Decimal from "decimal.js";
import {LogModule} from "@/src/lib/logger";
import {prisma} from "@/src/lib/prisma";
import {withAuth} from "@/src/lib/route-handler";
import {NextRequest} from "next/server";

const ROUTE = "/api/finance/nfe/launch";

export async function POST(req: NextRequest) {
  return withAuth(LogModule.NFE, ROUTE, async ({auth, success, error}) => {
    const {id} = await req.json();

    if (!id) return error("api.errors.missingRequiredFields", 400);

    const nfe = await prisma.nfe.findUnique({
      where: {id, tenant_id: auth.tenant_id},
      include: {
        items: {
          include: {
            product: {select: {id: true, stock: true}},
          },
        },
      },
    });

    if (!nfe) return error("api.errors.notFound", 404, {id});
    if (nfe.stock_added) return error("finance.nfe.errors.alreadyLaunched", 400);

    const ops: any[] = [];

    for (const item of nfe.items) {
      if (item.item_type === "ingredient" && item.ingredient_id) {
        ops.push(
          prisma.ingredient.update({
            where: {id: item.ingredient_id, tenant_id: auth.tenant_id},
            data: {stock: {increment: item.quantity}},
          }),
          prisma.ingredientCost.create({
            data: {
              tenant_id: auth.tenant_id,
              ingredient_id: item.ingredient_id,
              quantity: item.quantity,
              price: item.total_price,
              creator_id: auth.user.id,
            },
          }),
        );
      } else if (item.item_type === "product" && item.product_id) {
        const previousStock = new Decimal(String(item.product?.stock ?? 0));
        ops.push(
          prisma.product.update({
            where: {id: item.product_id, tenant_id: auth.tenant_id},
            data: {stock: {increment: item.quantity}},
          }),
          prisma.productStockChange.create({
            data: {
              tenant_id: auth.tenant_id,
              product_id: item.product_id,
              previous_stock: previousStock,
              new_stock: previousStock.plus(item.quantity),
              reason: null,
              creator_id: auth.user.id,
            },
          }),
        );
      } else if (item.item_type === "package" && item.package_id) {
        ops.push(
          prisma.package.update({
            where: {id: item.package_id, tenant_id: auth.tenant_id},
            data: {stock: {increment: item.quantity}},
          }),
          prisma.packageCost.create({
            data: {
              tenant_id: auth.tenant_id,
              package_id: item.package_id,
              quantity: item.quantity,
              price: item.total_price,
              creator_id: auth.user.id,
            },
          }),
        );
      }
    }

    ops.push(
      prisma.nfe.update({
        where: {id, tenant_id: auth.tenant_id},
        data: {stock_added: true},
      }),
    );

    await prisma.$transaction(ops);

    return success("update", {id});
  });
}
