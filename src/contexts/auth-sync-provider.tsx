"use client";
import {PropsWithChildren, useEffect} from "react";
import {useTenant} from "./tenant-context";
import {UserPermission} from "@/src/@types/global-types";
import {User} from "./tenant-context";

export function AuthSyncProvider(props: PropsWithChildren) {
  const {user, setUser, setPermissions, clearTenant} = useTenant();

  useEffect(() => {
    if (!user) return;

    fetch("/api/auth/me")
      .then((res) => {
        if (res.status === 401) {
          clearTenant();
          return null;
        }
        return res.ok ? res.json() : null;
      })
      .then((body) => {
        if (!body?.data) return;
        setUser(body.data.user as User);
        setPermissions(body.data.permissions as UserPermission[]);
      })
      .catch(() => {});
  }, []);

  return <>{props.children}</>;
}
