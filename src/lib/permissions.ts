import {MenuItem} from "@/src/layouts/authenticated/types";
import {intranetMenuItems} from "@/src/layouts/authenticated/menus";

export interface ModuleDefinition {
  key: string;
  labelKey: string;
  groupLabelKey: string;
  actions: string[];
}

export type PermissionsMap = Record<string, Record<string, boolean>>;

export type FormSection =
  | {type: "header"; group: string; labelKey: string}
  | {type: "module"; mod: ModuleDefinition};

function extractModuleDefinitions(items: MenuItem[], groupLabelKey?: string): ModuleDefinition[] {
  const result: ModuleDefinition[] = [];
  for (const item of items) {
    if (item.permission) {
      result.push({
        key: item.permission.key,
        labelKey: item.name,
        groupLabelKey: groupLabelKey ?? item.name,
        actions: item.permission.actions,
      });
    }
    if (item.children) {
      result.push(...extractModuleDefinitions(item.children, item.name));
    }
  }
  return result;
}

export const MODULE_DEFINITIONS: ModuleDefinition[] = extractModuleDefinitions(intranetMenuItems);

export function buildFormSections(): FormSection[] {
  const seenGroups = new Set<string>();
  return MODULE_DEFINITIONS.flatMap((mod) => {
    const groupKey = mod.key.split(".")[0];
    const items: FormSection[] = [];
    if (!seenGroups.has(groupKey)) {
      seenGroups.add(groupKey);
      items.push({type: "header", group: groupKey, labelKey: mod.groupLabelKey});
    }
    items.push({type: "module", mod});
    return items;
  });
}

export function buildDefaultPermissions(): PermissionsMap {
  const result: PermissionsMap = {};
  for (const mod of MODULE_DEFINITIONS) {
    const parts = mod.key.split(".");
    let obj: any = result;
    for (let i = 0; i < parts.length - 1; i++) {
      if (!obj[parts[i]]) obj[parts[i]] = {};
      obj = obj[parts[i]];
    }
    const last = parts[parts.length - 1];
    obj[last] = {};
    for (const action of mod.actions) {
      obj[last][action] = false;
    }
  }
  return result;
}

export function permissionsToFlat(permissions: PermissionsMap): {module: string; action: string}[] {
  const result: {module: string; action: string}[] = [];
  for (const mod of MODULE_DEFINITIONS) {
    const parts = mod.key.split(".");
    let obj: any = permissions;
    for (const part of parts) {
      obj = obj?.[part];
    }
    for (const action of mod.actions) {
      if (obj?.[action]) result.push({module: mod.key, action});
    }
  }
  return result;
}

export function flatToPermissions(flat: {module: string; action: string}[]): PermissionsMap {
  const result: any = buildDefaultPermissions();
  for (const perm of flat) {
    const parts = perm.module.split(".");
    let obj = result;
    for (let i = 0; i < parts.length - 1; i++) {
      if (!obj[parts[i]]) obj[parts[i]] = {};
      obj = obj[parts[i]];
    }
    const last = parts[parts.length - 1];
    if (!obj[last]) obj[last] = {};
    obj[last][perm.action] = true;
  }
  return result;
}
