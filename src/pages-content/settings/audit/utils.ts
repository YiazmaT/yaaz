import {AUDIT_MODULES} from "./constants";

export function getModuleLabel(module: string): string {
  return AUDIT_MODULES[module]?.label ?? module;
}

export function getActionLabel(module: string, actionType: string): string {
  return AUDIT_MODULES[module]?.actions.find((a) => a.action === actionType)?.label ?? "audit.actionTypes.other";
}
