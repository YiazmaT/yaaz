import {AuditActionType, AuditModule} from "./types";

export const AUDIT_MODULES: AuditModule[] = [{value: "ingredient", labelKey: "global.ingredients"}];

export const AUDIT_ACTION_TYPES: AuditActionType[] = [
  {value: "create", labelKey: "audit.actionTypes.create"},
  {value: "update", labelKey: "audit.actionTypes.update"},
  {value: "delete", labelKey: "audit.actionTypes.delete"},
];

export const ACTION_ROUTE_PATTERNS: Record<string, string[]> = {
  create: ["/create"],
  update: [
    "/update",
    "/toggle-active",
    "/add-stock",
    "/stock-change",
    "/pay",
    "/cancel-payment",
    "/launch",
    "/register-file",
    "/register-receipt",
    "/delete-file",
    "/delete-receipt",
    "/convert-quote",
  ],
  delete: ["/delete"],
};

export function getModuleLabelKey(module: string): string {
  return AUDIT_MODULES.find((m) => m.value === module)?.labelKey ?? module;
}

export function getActionTypeLabelKey(actionType: string): string {
  return AUDIT_ACTION_TYPES.find((a) => a.value === actionType)?.labelKey ?? "audit.actionTypes.other";
}

export function getActionTypeColor(actionType: string): "success" | "primary" | "error" | "default" {
  switch (actionType) {
    case "create":
      return "success";
    case "update":
      return "primary";
    case "delete":
      return "error";
    default:
      return "default";
  }
}
