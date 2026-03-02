import {AuditActionOption} from "./types";

export const AUDIT_MODULES: Record<string, {label: string; actions: AuditActionOption[]}> = {
  ingredient: {
    label: "global.ingredients",
    actions: [
      {action: "create", label: "audit.actionTypes.create", routes: ["/api/stock/ingredient/create"]},
      {action: "update", label: "audit.actionTypes.update", routes: ["/api/stock/ingredient/update"]},
      {action: "delete", label: "audit.actionTypes.delete", routes: ["/api/stock/ingredient/delete"]},
    ],
  },
};
