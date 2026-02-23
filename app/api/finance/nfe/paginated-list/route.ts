import {Prisma} from "@prisma/client";
import {LogModule} from "@/src/lib/logger";
import {prisma} from "@/src/lib/prisma";
import {withAuth} from "@/src/lib/route-handler";
import {NextRequest} from "next/server";

const ROUTE = "/api/finance/nfe/paginated-list";

export async function GET(req: NextRequest) {
  return withAuth(LogModule.NFE, ROUTE, async ({auth, success}) => {
    const {searchParams} = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const skip = (page - 1) * limit;

    const where: Prisma.NfeWhereInput = {tenant_id: auth.tenant_id, active: true};

    if (search) {
      const searchAsNumber = parseInt(search);
      where.OR = [
        {description: {contains: search, mode: "insensitive"}},
        {supplier: {contains: search, mode: "insensitive"}},
        {nfe_number: {contains: search, mode: "insensitive"}},
        ...(!isNaN(searchAsNumber) ? [{code: searchAsNumber}] : []),
      ];
    }

    const [data, total] = await Promise.all([
      prisma.nfe.findMany({
        where,
        skip,
        take: limit,
        orderBy: {creation_date: "desc"},
        include: {
          bank_account: {select: {id: true, name: true, balance: true}},
          _count: {select: {items: true}},
          items: {
            include: {
              ingredient: {select: {id: true, name: true, image: true, unity_of_measure: {select: {id: true, unity: true}}}},
              product: {select: {id: true, name: true, image: true}},
              package: {select: {id: true, name: true, image: true}},
            },
          },
        },
      }),
      prisma.nfe.count({where}),
    ]);

    return success("get", {data, total, page, limit});
  });
}
