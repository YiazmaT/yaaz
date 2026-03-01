"use client";
import {PropsWithChildren, createContext, useContext, useState} from "react";
import {Tenant} from "../pages-content/yaaz/tenants/types";
import {UserPermission} from "../@types/global-types";

const TENANT_COOKIE_KEY = "tenant";
const USER_COOKIE_KEY = "user";
const YAAZ_USER_COOKIE_KEY = "yaaz_user";
const PERMISSIONS_COOKIE_KEY = "user_permissions";
const COOKIE_MAX_AGE = 31536000; // 1 year

export interface User {
  id: string;
  name: string;
  login: string;
  image?: string | null;
  admin: boolean;
  owner: boolean;
}

export interface YaazUser {
  id: string;
  name: string;
  login: string;
  admin: boolean;
  image?: string | null;
}

interface TenantContextValue {
  tenant: Tenant | null;
  user: User | null;
  yaazUser: YaazUser | null;
  permissions: UserPermission[];
  setTenant: (tenant: Tenant | null) => void;
  setUser: (user: User | null) => void;
  setPermissions: (permissions: UserPermission[]) => void;
  clearTenant: () => void;
  setYaazUser: (user: YaazUser | null) => void;
  clearYaazUser: () => void;
}

const TenantContext = createContext<TenantContextValue>({
  tenant: null,
  user: null,
  yaazUser: null,
  permissions: [],
  setTenant: () => {},
  setUser: () => {},
  setPermissions: () => {},
  clearTenant: () => {},
  setYaazUser: () => {},
  clearYaazUser: () => {},
});

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function setCookie(name: string, value: string) {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${COOKIE_MAX_AGE}`;
}

function deleteCookie(name: string) {
  document.cookie = `${name}=; path=/; max-age=0`;
}

function getStoredTenant(): Tenant | null {
  const stored = getCookie(TENANT_COOKIE_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored) as Tenant;
  } catch {
    return null;
  }
}

function getStoredUser(): User | null {
  const stored = getCookie(USER_COOKIE_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored) as User;
  } catch {
    return null;
  }
}

function getStoredYaazUser(): YaazUser | null {
  const stored = getCookie(YAAZ_USER_COOKIE_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored) as YaazUser;
  } catch {
    return null;
  }
}

function getStoredPermissions(): UserPermission[] {
  const stored = getCookie(PERMISSIONS_COOKIE_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored) as UserPermission[];
  } catch {
    return [];
  }
}

interface TenantContextProviderProps extends PropsWithChildren {
  initialTenant?: Tenant | null;
  initialUser?: User | null;
  initialYaazUser?: YaazUser | null;
}

export function TenantContextProvider(props: TenantContextProviderProps) {
  const [tenant, setTenantState] = useState<Tenant | null>(() => props.initialTenant ?? getStoredTenant());
  const [user, setUserState] = useState<User | null>(() => props.initialUser ?? getStoredUser());
  const [yaazUser, setYaazUserState] = useState<YaazUser | null>(() => props.initialYaazUser ?? getStoredYaazUser());
  const [permissions, setPermissionsState] = useState<UserPermission[]>(() => getStoredPermissions());

  function setTenant(newTenant: Tenant | null) {
    setTenantState(newTenant);
    if (newTenant) {
      setCookie(TENANT_COOKIE_KEY, JSON.stringify(newTenant));
    } else {
      deleteCookie(TENANT_COOKIE_KEY);
    }
  }

  function setUser(newUser: User | null) {
    setUserState(newUser);
    if (newUser) {
      setCookie(USER_COOKIE_KEY, JSON.stringify(newUser));
    } else {
      deleteCookie(USER_COOKIE_KEY);
    }
  }

  function setPermissions(perms: UserPermission[]) {
    setPermissionsState(perms);
    setCookie(PERMISSIONS_COOKIE_KEY, JSON.stringify(perms));
  }

  function clearTenant() {
    setTenantState(null);
    setUserState(null);
    setPermissionsState([]);
    deleteCookie(TENANT_COOKIE_KEY);
    deleteCookie(USER_COOKIE_KEY);
    deleteCookie(PERMISSIONS_COOKIE_KEY);
  }

  function setYaazUser(newUser: YaazUser | null) {
    setYaazUserState(newUser);
    if (newUser) {
      setCookie(YAAZ_USER_COOKIE_KEY, JSON.stringify(newUser));
    } else {
      deleteCookie(YAAZ_USER_COOKIE_KEY);
    }
  }

  function clearYaazUser() {
    setYaazUserState(null);
    deleteCookie(YAAZ_USER_COOKIE_KEY);
  }

  return (
    <TenantContext.Provider value={{tenant, user, yaazUser, permissions, setTenant, setUser, setPermissions, clearTenant, setYaazUser, clearYaazUser}}>
      {props.children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  const {tenant, user, setTenant, setUser, setPermissions, clearTenant} = useContext(TenantContext);
  return {tenant, user, setTenant, setUser, setPermissions, clearTenant};
}

export function usePermissions() {
  const {permissions, user} = useContext(TenantContext);

  function can(module: string, action: string): boolean {
    if (!user) return false;
    if (user.admin || user.owner) return true;
    return permissions.some((p) => p.module === module && p.action === action);
  }

  return {permissions, can};
}

export function useYaazUser() {
  const {yaazUser, setYaazUser, clearYaazUser} = useContext(TenantContext);
  return {yaazUser, setYaazUser, clearYaazUser};
}
