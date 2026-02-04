import Decimal from "decimal.js";
import {prisma} from "@/src/lib/prisma";

interface SaleItemInput {
  product_id: string;
  quantity: number;
}

interface SalePackageInput {
  package_id: string;
  quantity: number;
}

export async function calculateApproximateCost(items: SaleItemInput[], packages: SalePackageInput[], tenantId: string): Promise<string> {
  let totalCost = new Decimal(0);

  if (items && items.length > 0) {
    const productIds = items.map((item) => item.product_id);

    const products = await prisma.product.findMany({
      where: {id: {in: productIds}, tenant_id: tenantId},
      include: {
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
    });

    for (const item of items) {
      const product = products.find((p) => p.id === item.product_id);
      if (!product) continue;

      const productQuantity = new Decimal(item.quantity);

      for (const comp of product.composition) {
        const lastCost = comp.ingredient.costs[0];
        if (lastCost) {
          const costPerUnit = new Decimal(lastCost.price).dividedBy(lastCost.quantity);
          const ingredientCost = costPerUnit.times(comp.quantity).times(productQuantity);
          totalCost = totalCost.plus(ingredientCost);
        }
      }

      for (const pkg of product.packages) {
        const lastCost = pkg.package.costs[0];
        if (lastCost) {
          const costPerUnit = new Decimal(lastCost.price).dividedBy(lastCost.quantity);
          const packageCost = costPerUnit.times(pkg.quantity).times(productQuantity);
          totalCost = totalCost.plus(packageCost);
        }
      }
    }
  }

  if (packages && packages.length > 0) {
    const packageIds = packages.map((pkg) => pkg.package_id);

    const dbPackages = await prisma.package.findMany({
      where: {id: {in: packageIds}, tenant_id: tenantId},
      include: {
        costs: {
          orderBy: {creation_date: "desc"},
          take: 1,
        },
      },
    });

    for (const pkg of packages) {
      const dbPackage = dbPackages.find((p) => p.id === pkg.package_id);
      if (!dbPackage) continue;

      const lastCost = dbPackage.costs[0];
      if (lastCost) {
        const costPerUnit = new Decimal(lastCost.price).dividedBy(lastCost.quantity);
        const packageCost = costPerUnit.times(pkg.quantity);
        totalCost = totalCost.plus(packageCost);
      }
    }
  }

  return totalCost.toString();
}
