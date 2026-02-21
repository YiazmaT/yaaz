import Decimal from "decimal.js";
import {PackageType} from "@prisma/client";
import {LogModule} from "@/src/lib/logger";
import {prisma} from "@/src/lib/prisma";
import {withAuth} from "@/src/lib/route-handler";
import {NextRequest} from "next/server";

const ROUTE = "/api/stock/package/paginated-list";

export async function GET(req: NextRequest) {
  return withAuth(LogModule.PACKAGE, ROUTE, async ({auth, success}) => {
    const {searchParams} = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const typeFilter = searchParams.get("type") as PackageType | null;
    const showInactives = searchParams.get("showInactives") === "true";
    const skip = (page - 1) * limit;

    const where: any = {tenant_id: auth.tenant_id};

    if (!showInactives) {
      where.active = true;
    }

    if (search) {
      const searchAsNumber = parseInt(search);
      where.OR = [
        {name: {contains: search, mode: "insensitive" as const}},
        {description: {contains: search, mode: "insensitive" as const}},
        ...(!isNaN(searchAsNumber) ? [{code: searchAsNumber}] : []),
      ];
    }

    if (typeFilter && Object.values(PackageType).includes(typeFilter)) {
      where.type = typeFilter;
    }

    const [packages, total] = await Promise.all([
      prisma.package.findMany({
        where,
        skip,
        take: limit,
        orderBy: {name: "asc"},
        omit: {creation_date: true, creator_id: true, last_edit_date: true, last_editor_id: true},
        include: {
          unity_of_measure: {select: {id: true, unity: true}},
          costs: {
            where: {price: {gt: 0}},
            orderBy: {creation_date: "desc"},
            take: 1,
          },
        },
      }),
      prisma.package.count({where}),
    ]);

    const data = packages.map((pkg) => {
      const lastCostEntry = pkg.costs[0];
      let lastCost = null;
      if (lastCostEntry) {
        const quantity = new Decimal(lastCostEntry.quantity);
        if (quantity.greaterThan(0)) {
          lastCost = new Decimal(lastCostEntry.price).div(quantity).toNumber();
        }
      }
      return {
        ...pkg,
        lastCost,
      };
    });

    return success("get", {data, total, page, limit});
  });
}
