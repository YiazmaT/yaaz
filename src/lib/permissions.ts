export interface ModuleDefinition {
  key: string;
  labelKey: string;
  actions: string[];
}

export type PermissionsMap = Record<string, Record<string, boolean>>;

export const MODULE_DEFINITIONS: ModuleDefinition[] = [
  {
    key: "dashboard",
    labelKey: "userGroups.modules.dashboard",
    actions: ["read"],
  },
  {
    key: "sales",
    labelKey: "userGroups.modules.sales",
    actions: ["read", "create", "edit", "delete"],
  },
  {
    key: "clients",
    labelKey: "userGroups.modules.clients",
    actions: ["read", "create", "edit", "delete"],
  },
  {
    key: "stock.products",
    labelKey: "userGroups.modules.stock.products",
    actions: ["read", "create", "edit", "delete"],
  },
  {
    key: "stock.ingredients",
    labelKey: "userGroups.modules.stock.ingredients",
    actions: ["read", "create", "edit", "delete"],
  },
  {
    key: "stock.packages",
    labelKey: "userGroups.modules.stock.packages",
    actions: ["read", "create", "edit", "delete"],
  },
  {
    key: "stock.unity_of_measure",
    labelKey: "userGroups.modules.stock.unity_of_measure",
    actions: ["read", "create", "edit", "delete"],
  },
  {
    key: "finance.bills",
    labelKey: "userGroups.modules.finance.bills",
    actions: ["read", "create", "edit", "delete"],
  },
  {
    key: "finance.banks",
    labelKey: "userGroups.modules.finance.banks",
    actions: ["read", "create", "edit", "delete"],
  },
  {
    key: "finance.categories",
    labelKey: "userGroups.modules.finance.categories",
    actions: ["read", "create", "edit", "delete"],
  },
  {
    key: "finance.payment_method",
    labelKey: "userGroups.modules.finance.payment_method",
    actions: ["read", "create", "edit", "delete"],
  },
  {
    key: "finance.nfe",
    labelKey: "userGroups.modules.finance.nfe",
    actions: ["read", "create", "edit", "delete"],
  },
  {
    key: "reports",
    labelKey: "userGroups.modules.reports",
    actions: ["read"],
  },
];

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
