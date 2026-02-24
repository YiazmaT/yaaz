import {LogModule} from "@/src/lib/logger";
import {buildNfeStockOps} from "@/src/lib/nfe-stock";
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

    const ops = buildNfeStockOps(nfe.items, auth.tenant_id, auth.user.id, nfe.code);

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
