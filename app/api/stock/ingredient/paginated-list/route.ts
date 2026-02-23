import Decimal from "decimal.js";
import {LogModule} from "@/src/lib/logger";
import {prisma} from "@/src/lib/prisma";
import {withAuth} from "@/src/lib/route-handler";
import {NextRequest} from "next/server";

const ROUTE = "/api/stock/ingredient/paginated-list";

export async function GET(req: NextRequest) {
  return withAuth(LogModule.INGREDIENT, ROUTE, async ({auth, success}) => {
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
      if (search.startsWith("#")) {
        const codeSearch = parseInt(search.slice(1));
        if (!isNaN(codeSearch)) {
          where.code = codeSearch;
        }
      } else {
        const searchAsNumber = parseInt(search);
        where.OR = [
          {name: {contains: search, mode: "insensitive" as const}},
          {description: {contains: search, mode: "insensitive" as const}},
          ...(!isNaN(searchAsNumber) ? [{code: searchAsNumber}] : []),
        ];
      }
    }

    const [ingredients, total] = await Promise.all([
      prisma.ingredient.findMany({
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
      prisma.ingredient.count({where}),
    ]);

    const data = ingredients.map((ingredient) => {
      const lastCostEntry = ingredient.costs[0];
      let lastCost = null;
      if (lastCostEntry) {
        const quantity = new Decimal(lastCostEntry.quantity);
        if (quantity.greaterThan(0)) {
          lastCost = new Decimal(lastCostEntry.price).div(quantity).toNumber();
        }
      }
      return {
        ...ingredient,
        lastCost,
      };
    });

    return success("get", {data, total, page, limit});
  });
}
