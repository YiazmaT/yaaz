import {LogModule} from "@/src/lib/logger";
import {prisma} from "@/src/lib/prisma";
import {withAuth} from "@/src/lib/route-handler";
import {NextRequest} from "next/server";

const ROUTE = "/api/finance/category/create";

export async function POST(req: NextRequest) {
  return withAuth(LogModule.BILL, ROUTE, async ({auth, success, error}) => {
    const {name} = await req.json();

    if (!name) return error("api.errors.missingRequiredFields", 400);

    const existing = await prisma.financeCategory.findFirst({where: {tenant_id: auth.tenant_id, name: {equals: name, mode: "insensitive"}}});
    if (existing) return error("finance.categories.errors.nameAlreadyExists", 400, {existing});

    const category = await prisma.financeCategory.create({
      data: {
        tenant_id: auth.tenant_id,
        name,
        creator_id: auth.user.id,
      },
    });

    return success("create", category);
  });
}
