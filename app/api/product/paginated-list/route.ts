import Decimal from "decimal.js";
import {authenticateRequest} from "@/src/lib/auth";
import {logCritical, LogModule, LogSource, logGet} from "@/src/lib/logger";
import {prisma} from "@/src/lib/prisma";
import {NextRequest, NextResponse} from "next/server";

const ROUTE = "/api/product/paginated-list";

export async function GET(req: NextRequest) {
  const auth = await authenticateRequest(LogModule.PRODUCT, ROUTE);
  if (auth.error) return auth.error;

  try {
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
      where.OR = [{name: {contains: search, mode: "insensitive" as const}}, {description: {contains: search, mode: "insensitive" as const}}];
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: {name: "asc"},
        omit: {creation_date: true, creator_id: true, last_edit_date: true, last_editor_id: true},
        include: {
          composition: {
            include: {
              ingredient: {
                include: {
                  costs: {
                    where: {price: {gt: 0}},
                    orderBy: {creation_date: "desc"},
                    take: 1,
                  },
                },
              },
            },
          },
          packages: {
            include: {
              package: {
                include: {
                  costs: {
                    where: {price: {gt: 0}},
                    orderBy: {creation_date: "desc"},
                    take: 1,
                  },
                },
              },
            },
          },
        },
      }),
      prisma.product.count({where}),
    ]);

    const data = products.map((product) => {
      let approximateCost = new Decimal(0);

      for (const comp of product.composition) {
        const lastCost = comp.ingredient.costs[0];
        if (lastCost) {
          const costPerUnit = new Decimal(lastCost.price).div(lastCost.quantity);
          const ingredientCost = costPerUnit.times(comp.quantity);
          approximateCost = approximateCost.plus(ingredientCost);
        }
      }

      for (const pkg of product.packages) {
        const lastCost = pkg.package.costs[0];
        if (lastCost) {
          const costPerUnit = new Decimal(lastCost.price).div(lastCost.quantity);
          const packageCost = costPerUnit.times(pkg.quantity);
          approximateCost = approximateCost.plus(packageCost);
        }
      }

      return {
        ...product,
        displayLandingPage: product.display_landing_page,
        approximateCost: approximateCost.toNumber(),
      };
    });

    const response = {data, total, page, limit};

    logGet({module: LogModule.PRODUCT, source: LogSource.API, content: response, userId: auth.user!.id, tenantId: auth.tenant_id, route: ROUTE});

    return NextResponse.json(response, {status: 200});
  } catch (error) {
    await logCritical({module: LogModule.PRODUCT, source: LogSource.API, error, route: ROUTE, userId: auth.user!.id, tenantId: auth.tenant_id});
    return NextResponse.json({error: "api.errors.somethingWentWrong"}, {status: 500});
  }
}
