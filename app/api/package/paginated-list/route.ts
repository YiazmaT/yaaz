import Decimal from "decimal.js";
import {PackageType} from "@prisma/client";
import {LogModule} from "@/src/lib/logger";
import {prisma} from "@/src/lib/prisma";
import {withAuth} from "@/src/lib/route-handler";
import {NextRequest, NextResponse} from "next/server";

const ROUTE = "/api/package/paginated-list";

export async function GET(req: NextRequest) {
  return withAuth(LogModule.PACKAGE, ROUTE, async (auth, log) => {
    const {searchParams} = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const typeFilter = searchParams.get("type") as PackageType | null;
    const skip = (page - 1) * limit;

    const where: any = {tenant_id: auth.tenant_id};

    if (search) {
      where.OR = [{name: {contains: search, mode: "insensitive" as const}}, {description: {contains: search, mode: "insensitive" as const}}];
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

    const response = {data, total, page, limit};
    log("get", {content: response});

    return NextResponse.json(response, {status: 200});
  });
}
