import Decimal from "decimal.js";
import {LogModule, LogSource, logCreate} from "@/src/lib/logger";
import {NfeItemPayload} from "@/src/pages-content/finance/nfe/dto";

export interface NfeIngredientLogItem {
  name: string;
  code: number;
  image: string | null;
  unity?: string;
  quantity: string;
  previousStock: string;
  newStock: string;
  cost: string;
}

export function computeNewStock(previousStock: string | number, quantity: string | number): string {
  return new Decimal(String(previousStock)).plus(new Decimal(String(quantity))).toString();
}

/** Build log items from Prisma NfeItem rows (launch route — cost from total_price). */
export function buildIngredientLogItemsFromNfeItems(items: any[]): NfeIngredientLogItem[] {
  return items
    .filter((item) => item.item_type === "ingredient" && item.ingredient)
    .map((item) => ({
      name: item.ingredient.name,
      code: item.ingredient.code,
      image: item.ingredient.image,
      unity: item.ingredient.unity_of_measure?.unity,
      quantity: item.quantity.toString(),
      previousStock: item.ingredient.stock.toString(),
      newStock: computeNewStock(item.ingredient.stock, item.quantity),
      cost: item.total_price.toString(),
    }));
}

/** Build log items from NfeItemPayload + ingredientMap (create route — cost from quantity × unitPrice). */
export function buildIngredientLogItemsFromPayload(items: NfeItemPayload[], ingredientMap: Map<string, any>): NfeIngredientLogItem[] {
  return items
    .filter((item) => item.itemType === "ingredient" && ingredientMap.has(item.itemId))
    .map((item) => {
      const ingredient = ingredientMap.get(item.itemId);
      return {
        name: ingredient.name,
        code: ingredient.code,
        image: ingredient.image,
        unity: ingredient.unity_of_measure?.unity,
        quantity: item.quantity.toString(),
        previousStock: ingredient.stock.toString(),
        newStock: computeNewStock(ingredient.stock, item.quantity),
        cost: new Decimal(item.quantity).times(new Decimal(item.unitPrice)).toDecimalPlaces(2).toString(),
      };
    });
}

export function logNfeIngredientStock(params: {
  nfeCode: number;
  items: NfeIngredientLogItem[];
  route: string;
  userId: string;
  tenantId: string;
}): void {
  if (params.items.length === 0) return;
  logCreate({
    module: LogModule.INGREDIENT,
    source: LogSource.API,
    route: params.route,
    userId: params.userId,
    tenantId: params.tenantId,
    content: {nfeCode: params.nfeCode, nfeItems: params.items},
  });
}
