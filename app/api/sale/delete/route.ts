import {LogModule} from "@/src/lib/logger";
import {prisma} from "@/src/lib/prisma";
import {withAuth} from "@/src/lib/route-handler";
import {DeleteSaleDto} from "@/src/pages-content/sales/dto";
import {NextRequest, NextResponse} from "next/server";

const ROUTE = "/api/sale/delete";

export async function DELETE(req: NextRequest) {
  return withAuth(LogModule.SALE, ROUTE, async (auth, log, error) => {
    const {id}: DeleteSaleDto = await req.json();

    if (!id) {
      return error("api.errors.missingRequiredFields", 400);
    }

    const sale = await prisma.sale.findUnique({
      where: {id, tenant_id: auth.tenant_id},
      include: {items: true, packages: true},
    });

    if (!sale) {
      return error("api.errors.notFound", 404, {id});
    }

    await prisma.$transaction(async (tx) => {
      if (!sale.is_quote) {
        for (const item of sale.items) {
          await tx.product.update({
            where: {id: item.product_id},
            data: {stock: {increment: item.quantity}},
          });
        }

        for (const pkg of sale.packages) {
          await tx.package.update({
            where: {id: pkg.package_id},
            data: {stock: {increment: pkg.quantity}},
          });
        }
      }

      await tx.sale.delete({where: {id}});
    });

    log("delete", {content: sale});

    return NextResponse.json({success: true}, {status: 200});
  });
}
