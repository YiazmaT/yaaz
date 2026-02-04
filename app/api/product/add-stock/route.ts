import Decimal from "decimal.js";
import {authenticateRequest} from "@/src/lib/auth";
import {logCritical, logError, LogModule, LogSource, logCreate} from "@/src/lib/logger";
import {prisma} from "@/src/lib/prisma";
import {AddProductStockDto, IngredientStockWarning, PackageStockWarning} from "@/src/pages-content/products/dto";
import {NextRequest, NextResponse} from "next/server";

const ROUTE = "/api/product/add-stock";

export async function POST(req: NextRequest) {
  const auth = await authenticateRequest(LogModule.PRODUCT, ROUTE);
  if (auth.error) return auth.error;

  try {
    const {items, deductIngredients, deductPackages, force}: AddProductStockDto = await req.json();

    if (!items || !Array.isArray(items) || items.length === 0) {
      logError({
        module: LogModule.PRODUCT,
        source: LogSource.API,
        message: "api.errors.missingRequiredFields",
        route: ROUTE,
        userId: auth.user!.id,
        tenantId: auth.tenant_id,
      });
      return NextResponse.json({error: "api.errors.missingRequiredFields"}, {status: 400});
    }

    const products = await prisma.product.findMany({
      where: {id: {in: items.map((item) => item.productId)}, tenant_id: auth.tenant_id},
      include: {
        composition: {
          include: {
            ingredient: true,
          },
        },
        packages: {
          include: {
            package: true,
          },
        },
      },
    });

    const ingredientRequirements: Record<string, {name: string; required: Decimal; currentStock: Decimal}> = {};
    const packageRequirements: Record<string, {name: string; required: Decimal; currentStock: Decimal}> = {};

    for (const item of items) {
      const product = products.find((p) => p.id === item.productId);
      if (!product) continue;

      if (deductIngredients) {
        for (const comp of product.composition) {
          const ingredientId = comp.ingredient_id;
          const required = new Decimal(comp.quantity).times(item.quantity);

          if (!ingredientRequirements[ingredientId]) {
            ingredientRequirements[ingredientId] = {
              name: comp.ingredient.name,
              required: new Decimal(0),
              currentStock: new Decimal(comp.ingredient.stock),
            };
          }
          ingredientRequirements[ingredientId].required = ingredientRequirements[ingredientId].required.plus(required);
        }
      }

      if (deductPackages) {
        for (const pkg of product.packages) {
          const packageId = pkg.package_id;
          const required = new Decimal(pkg.quantity).times(item.quantity);

          if (!packageRequirements[packageId]) {
            packageRequirements[packageId] = {
              name: pkg.package.name,
              required: new Decimal(0),
              currentStock: new Decimal(pkg.package.stock),
            };
          }
          packageRequirements[packageId].required = packageRequirements[packageId].required.plus(required);
        }
      }
    }

    const ingredientWarnings: IngredientStockWarning[] = [];
    for (const [ingredientId, data] of Object.entries(ingredientRequirements)) {
      const resultingStock = data.currentStock.minus(data.required);
      if (resultingStock.lessThan(0)) {
        ingredientWarnings.push({
          ingredientId,
          ingredientName: data.name,
          currentStock: data.currentStock.toNumber(),
          requiredAmount: data.required.toNumber(),
          resultingStock: resultingStock.toNumber(),
        });
      }
    }

    const packageWarnings: PackageStockWarning[] = [];
    for (const [packageId, data] of Object.entries(packageRequirements)) {
      const resultingStock = data.currentStock.minus(data.required);
      if (resultingStock.lessThan(0)) {
        packageWarnings.push({
          packageId,
          packageName: data.name,
          currentStock: data.currentStock.toNumber(),
          requiredAmount: data.required.toNumber(),
          resultingStock: resultingStock.toNumber(),
        });
      }
    }

    const hasWarnings = ingredientWarnings.length > 0 || packageWarnings.length > 0;
    if (hasWarnings && !force) {
      return NextResponse.json({success: false, ingredientWarnings, packageWarnings}, {status: 200});
    }

    const transactionOperations = [
      ...items.map((item) =>
        prisma.product.update({
          where: {id: item.productId},
          data: {stock: {increment: item.quantity}},
        }),
      ),
      ...Object.entries(ingredientRequirements).map(([ingredientId, data]) =>
        prisma.ingredient.update({
          where: {id: ingredientId},
          data: {stock: {decrement: data.required.toNumber()}},
        }),
      ),
      ...Object.entries(packageRequirements).map(([packageId, data]) =>
        prisma.package.update({
          where: {id: packageId},
          data: {stock: {decrement: data.required.toNumber()}},
        }),
      ),
    ];

    await prisma.$transaction(transactionOperations);

    logCreate({module: LogModule.PRODUCT, source: LogSource.API, content: {items, deductIngredients, deductPackages}, route: ROUTE, userId: auth.user!.id, tenantId: auth.tenant_id});

    return NextResponse.json({success: true}, {status: 200});
  } catch (error) {
    await logCritical({module: LogModule.PRODUCT, source: LogSource.API, error, route: ROUTE, userId: auth.user!.id, tenantId: auth.tenant_id});
    return NextResponse.json({error: "api.errors.somethingWentWrong"}, {status: 500});
  }
}
