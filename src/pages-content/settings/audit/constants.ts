import {AuditActionOption} from "./types";
import {getIngredientCreateColumns, IngredientCreateContent} from "./combinations/ingredient-create";
import {getIngredientEditColumns, IngredientEditContent} from "./combinations/ingredient-edit";
import {getIngredientStockColumns, IngredientStockContent} from "./combinations/ingredient-stock";

export const AUDIT_MODULES: Record<string, {label: string; actions: AuditActionOption[]}> = {
  ingredient: {
    label: "global.ingredients",
    actions: [
      {
        action: "create",
        label: "audit.actionTypes.create",
        routes: ["/api/stock/ingredient/create"],
        columnsFactory: getIngredientCreateColumns,
        MobileContent: IngredientCreateContent,
      },
      {
        action: "update",
        label: "audit.actionTypes.update",
        routes: ["/api/stock/ingredient/update", "/api/stock/ingredient/toggle-active"],
        columnsFactory: getIngredientEditColumns,
        MobileContent: IngredientEditContent,
      },
      {
        action: "stock",
        label: "audit.actionTypes.stock",
        routes: ["/api/stock/ingredient/add-stock", "/api/stock/ingredient/stock-change"],
        columnsFactory: getIngredientStockColumns,
        MobileContent: IngredientStockContent,
      },
      {
        action: "delete",
        label: "audit.actionTypes.delete",
        routes: ["/api/stock/ingredient/delete"],
        columnsFactory: getIngredientCreateColumns,
        MobileContent: IngredientCreateContent,
      },
    ],
  },
};
