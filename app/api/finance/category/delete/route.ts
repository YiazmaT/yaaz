import {LogModule} from "@/src/lib/logger";
import {prisma} from "@/src/lib/prisma";
import {withAuth} from "@/src/lib/route-handler";
import {DeleteCategoryDto} from "@/src/pages-content/finance/categories/dto";
import {NextRequest} from "next/server";

const ROUTE = "/api/finance/category/delete";

export async function DELETE(req: NextRequest) {
  return withAuth(LogModule.CATEGORIES, ROUTE, async ({auth, success, error}) => {
    const {id}: DeleteCategoryDto = await req.json();

    if (!id) return error("api.errors.missingRequiredFields", 400);

    const category = await prisma.financeCategory.findUnique({where: {id, tenant_id: auth.tenant_id}});
    if (!category) return error("api.errors.notFound", 404, {id});

    const [billCount, transactionCount] = await Promise.all([
      prisma.bill.count({where: {category_id: id, tenant_id: auth.tenant_id}}),
      prisma.bankTransaction.count({where: {category_id: id, tenant_id: auth.tenant_id}}),
    ]);

    const total = billCount + transactionCount;

    if (total > 0) {
      return error("finance.categories.errors.inUse", 400, {id, billCount, transactionCount, total}, {billCount, transactionCount, total});
    }

    await prisma.financeCategory.delete({where: {id, tenant_id: auth.tenant_id}});

    return success("delete", category);
  });
}
