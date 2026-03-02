import {AuditActionOption} from "./types";

export const AUDIT_MODULES: Record<string, {label: string; actions: AuditActionOption[]}> = {
  ingredient: {
    label: "global.ingredients",
    actions: [
      {action: "create", label: "audit.actionTypes.create", route: "/api/stock/ingredient/create"},
      {action: "update", label: "audit.actionTypes.update", route: "/api/stock/ingredient/update"},
      {action: "delete", label: "audit.actionTypes.delete", route: "/api/stock/ingredient/delete"},
    ],
  },
};
