import {authenticateRequest} from "@/src/lib/auth";
import {logCritical, logGet, LogModule, LogSource} from "@/src/lib/logger";
import {prisma} from "@/src/lib/prisma";
import {NextRequest, NextResponse} from "next/server";
import {startOfDay, endOfDay, parseISO} from "date-fns";
import {fromZonedTime} from "date-fns-tz";
import Decimal from "decimal.js";

const ROUTE = "/api/reports/sales/profit-margin";

export async function GET(req: NextRequest) {
  const auth = await authenticateRequest(LogModule.REPORTS, ROUTE);
  if (auth.error) return auth.error;

  try {
    const {searchParams} = new URL(req.url);
    const dateFrom = searchParams.get("dateFrom") || "";
    const dateTo = searchParams.get("dateTo") || "";
    const productId = searchParams.get("productId") || "";
    const timezone = searchParams.get("timezone") || "America/Sao_Paulo";

    if (!dateFrom || !dateTo) {
      return NextResponse.json({error: "api.errors.missingRequiredFields"}, {status: 400});
    }

    const zonedStart = startOfDay(parseISO(dateFrom));
    const zonedEnd = endOfDay(parseISO(dateTo));
    const utcStart = fromZonedTime(zonedStart, timezone);
    const utcEnd = fromZonedTime(zonedEnd, timezone);

    const whereClause: any = {
      tenant_id: auth.tenant_id,
      sale: {
        creation_date: {
          gte: utcStart,
          lte: utcEnd,
        },
      },
    };

    if (productId) {
      whereClause.product_id = productId;
    }

    const saleItems = await prisma.saleItem.findMany({
      where: whereClause,
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            composition: {
              include: {
                ingredient: {
                  include: {
                    costs: {
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
                      orderBy: {creation_date: "desc"},
                      take: 1,
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    const productMap = new Map<
      string,
      {
        productId: string;
        productName: string;
        quantitySold: number;
        revenue: Decimal;
        cost: Decimal;
      }
    >();

    saleItems.forEach((item) => {
      const product = item.product;
      const existing = productMap.get(product.id);

      let productCost = new Decimal(0);

      product.composition.forEach((comp) => {
        const lastCost = comp.ingredient.costs[0];
        if (lastCost) {
          const unitCost = new Decimal(lastCost.price.toString()).div(new Decimal(lastCost.quantity.toString()));
          productCost = productCost.plus(unitCost.times(new Decimal(comp.quantity.toString())));
        }
      });

      product.packages.forEach((pkg) => {
        const lastCost = pkg.package.costs[0];
        if (lastCost) {
          const unitCost = new Decimal(lastCost.price.toString()).div(new Decimal(lastCost.quantity.toString()));
          productCost = productCost.plus(unitCost.times(new Decimal(pkg.quantity.toString())));
        }
      });

      const itemRevenue = new Decimal(product.price.toString()).times(item.quantity);
      const itemCost = productCost.times(item.quantity);

      if (existing) {
        existing.quantitySold += item.quantity;
        existing.revenue = existing.revenue.plus(itemRevenue);
        existing.cost = existing.cost.plus(itemCost);
      } else {
        productMap.set(product.id, {
          productId: product.id,
          productName: product.name,
          quantitySold: item.quantity,
          revenue: itemRevenue,
          cost: itemCost,
        });
      }
    });

    const result = Array.from(productMap.values()).map((item) => {
      const profit = item.revenue.minus(item.cost);
      const marginPercent = item.revenue.greaterThan(0) ? profit.div(item.revenue).times(100) : new Decimal(0);

      return {
        productId: item.productId,
        productName: item.productName,
        quantitySold: item.quantitySold,
        revenue: item.revenue.toFixed(2),
        cost: item.cost.toFixed(2),
        profit: profit.toFixed(2),
        marginPercent: marginPercent.toFixed(1),
      };
    });

    result.sort((a, b) => parseFloat(b.profit) - parseFloat(a.profit));

    logGet({module: LogModule.REPORTS, source: LogSource.API, userId: auth.user!.id, tenantId: auth.tenant_id, content: result, route: ROUTE});

    return NextResponse.json(result, {status: 200});
  } catch (error) {
    await logCritical({module: LogModule.REPORTS, source: LogSource.API, error, route: ROUTE, userId: auth.user!.id, tenantId: auth.tenant_id});
    return NextResponse.json({error: "api.errors.somethingWentWrong"}, {status: 500});
  }
}
