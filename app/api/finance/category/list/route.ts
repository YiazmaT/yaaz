import {LogModule} from "@/src/lib/logger";
import {prisma} from "@/src/lib/prisma";
import {withAuth} from "@/src/lib/route-handler";

const ROUTE = "/api/finance/category/list";

export async function GET() {
  return withAuth(LogModule.FINANCE, ROUTE, async ({auth, success}) => {
    const data = await prisma.financeCategory.findMany({
      where: {tenant_id: auth.tenant_id, active: true},
      orderBy: {name: "asc"},
      select: {id: true, name: true},
    });

    return success("get", data);
  });
}
