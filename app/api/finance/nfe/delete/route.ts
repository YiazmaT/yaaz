import Decimal from "decimal.js";
import {LogModule} from "@/src/lib/logger";
import {prisma} from "@/src/lib/prisma";
import {deleteFromR2, extractR2KeyFromUrl} from "@/src/lib/r2";
import {withAuth} from "@/src/lib/route-handler";
import {NextRequest} from "next/server";

const ROUTE = "/api/finance/nfe/delete";

export async function DELETE(req: NextRequest) {
  return withAuth(LogModule.FINANCE, ROUTE, async ({auth, success, error}) => {
    const {id} = await req.json();

    if (!id) return error("api.errors.missingRequiredFields", 400);

    const nfe = await prisma.nfe.findUnique({
      where: {id, tenant_id: auth.tenant_id},
      include: {items: true},
    });
    if (!nfe) return error("api.errors.notFound", 404, {id});

    if (nfe.stock_added) {
      const reverseOps = [];
      for (const item of nfe.items) {
        const qty = new Decimal(item.quantity.toString());
        switch (item.item_type) {
          case "ingredient":
            if (item.ingredient_id)
              reverseOps.push(
                prisma.ingredient.update({where: {id: item.ingredient_id, tenant_id: auth.tenant_id}, data: {stock: {decrement: qty.toNumber()}}}),
              );
            break;
          case "product":
            if (item.product_id)
              reverseOps.push(
                prisma.product.update({
                  where: {id: item.product_id, tenant_id: auth.tenant_id},
                  data: {stock: {decrement: Math.round(qty.toNumber())}},
                }),
              );
            break;
          case "package":
            if (item.package_id)
              reverseOps.push(
                prisma.package.update({where: {id: item.package_id, tenant_id: auth.tenant_id}, data: {stock: {decrement: qty.toNumber()}}}),
              );
            break;
        }
      }
      if (reverseOps.length > 0) await prisma.$transaction(reverseOps);
    }

    if (nfe.bank_deducted && nfe.bank_transaction_id && nfe.bank_account_id) {
      const amount = new Decimal(nfe.total_amount.toString());
      await prisma.$transaction([
        prisma.bankAccount.update({
          where: {id: nfe.bank_account_id, tenant_id: auth.tenant_id},
          data: {balance: {increment: amount.toNumber()}},
        }),
        prisma.bankTransaction.delete({where: {id: nfe.bank_transaction_id}}),
      ]);
    }

    if (nfe.file_url) {
      const key = extractR2KeyFromUrl(nfe.file_url);
      if (key) {
        const deleted = await deleteFromR2(key, auth.tenant_id);
        if (!deleted) return error("api.errors.deleteFailed", 400, {fileUrl: nfe.file_url});
      }
    }

    await prisma.nfe.delete({where: {id, tenant_id: auth.tenant_id}});

    return success("delete", nfe);
  });
}
