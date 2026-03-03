import {AUDIT_MODULES} from "./constants";
import {AuditTranslateFn} from "./types";

export function formatAuditValue(value: any, translate: AuditTranslateFn): string {
  if (typeof value === "boolean") return value ? translate("global.yes") : translate("global.no");
  return value ?? "-";
}

export function getModuleLabel(module: string): string {
  return AUDIT_MODULES[module]?.label ?? module;
}

export function getActionLabel(module: string, actionType: string): string {
  return AUDIT_MODULES[module]?.actions.find((a) => a.action === actionType)?.label ?? "audit.actionTypes.other";
}
