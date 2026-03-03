import {LogModule} from "@/src/lib/logger";
import {buildNfeStockOps} from "@/src/lib/nfe/nfe-stock";
import {buildIngredientLogItemsFromNfeItems, logNfeIngredientStock} from "@/src/lib/ingredients/nfe-ingredient-audit";
import {prisma} from "@/src/lib/prisma";
import {withAuth} from "@/src/lib/route-handler";
import {NextRequest} from "next/server";

const ROUTE = "/api/finance/nfe/launch";
const KEY = "finance.nfe";
const ACTION = "edit";

export async function POST(req: NextRequest) {
  return withAuth(LogModule.NFE, ROUTE, {key: KEY, action: ACTION}, async ({auth, success, error}) => {
    const {id} = await req.json();

    if (!id) return error("api.errors.missingRequiredFields", 400);

    const nfe = await prisma.nfe.findUnique({
      where: {id, tenant_id: auth.tenant_id},
      include: {
        items: {
          include: {
            product: {select: {id: true, stock: true}},
            ingredient: {
              select: {
                id: true,
                name: true,
                code: true,
                image: true,
                stock: true,
                unity_of_measure: {select: {unity: true}},
              },
            },
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

    logNfeIngredientStock({
      nfeCode: nfe.code,
      items: buildIngredientLogItemsFromNfeItems(nfe.items),
      route: ROUTE,
      userId: auth.user.id,
      tenantId: auth.tenant_id,
    });

    return success("update", {id});
  });
}
