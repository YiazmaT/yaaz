import {LogModule} from "@/src/lib/logger";
import {prisma} from "@/src/lib/prisma";
import {withAuth} from "@/src/lib/route-handler";
import {NextRequest} from "next/server";

const ROUTE = "/api/finance/payment-method/paginated-list";

export async function GET(req: NextRequest) {
  return withAuth(LogModule.PAYMENT_METHOD, ROUTE, async ({auth, success}) => {
    const {searchParams} = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const showInactives = searchParams.get("showInactives") === "true";
    const skip = (page - 1) * limit;

    const where: any = {tenant_id: auth.tenant_id};

    if (!showInactives) {
      where.active = true;
    }

    if (search) {
      where.name = {contains: search, mode: "insensitive"};
    }

    const [raw, total] = await Promise.all([
      prisma.financePaymentMethod.findMany({
        where,
        skip,
        take: limit,
        orderBy: {name: "asc"},
        select: {
          id: true,
          name: true,
          active: true,
          bank_account_id: true,
          bank_account: {select: {name: true}},
        },
      }),
      prisma.financePaymentMethod.count({where}),
    ]);

    const data = raw.map((item) => ({
      id: item.id,
      name: item.name,
      active: item.active,
      bank_account_id: item.bank_account_id,
      bank_account_name: item.bank_account?.name ?? null,
    }));

    return success("get", {data, total, page, limit});
  });
}
