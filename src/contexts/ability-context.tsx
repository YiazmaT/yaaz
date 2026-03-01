"use client";
import {createContext, PropsWithChildren, useMemo} from "react";
import {createMongoAbility, MongoAbility, AbilityBuilder} from "@casl/ability";
import {createContextualCan} from "@casl/react";
import {useTenant, usePermissions} from "./tenant-context";

export type AppAbility = MongoAbility<[string, string]>;

const defaultAbility = createMongoAbility<AppAbility>([{action: "manage", subject: "all"}]);

export const AbilityContext = createContext<AppAbility>(defaultAbility);
export const Can = createContextualCan(AbilityContext.Consumer);

export function AbilityProvider({children}: PropsWithChildren) {
  const {user} = useTenant();
  const {permissions} = usePermissions();

  const ability = useMemo(() => {
    const {can, build} = new AbilityBuilder<AppAbility>(createMongoAbility);

    if (user?.admin || user?.owner) {
      can("manage", "all");
    } else {
      for (const p of permissions) {
        can(p.action, p.key);
      }
    }

    return build();
  }, [user, permissions]);

  return <AbilityContext.Provider value={ability}>{children}</AbilityContext.Provider>;
}
