"use client";
import {PropsWithChildren, createContext, useContext, useState} from "react";
import {Tenant} from "../pages-content/tenants/types";

const TENANT_COOKIE_KEY = "tenant";
const USER_COOKIE_KEY = "user";
const YAAZ_USER_COOKIE_KEY = "yaaz_user";
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
}

interface TenantContextValue {
  tenant: Tenant | null;
  user: User | null;
  yaazUser: YaazUser | null;
  setTenant: (tenant: Tenant | null) => void;
  setUser: (user: User | null) => void;
  clearTenant: () => void;
  setYaazUser: (user: YaazUser | null) => void;
  clearYaazUser: () => void;
}

const TenantContext = createContext<TenantContextValue>({
  tenant: null,
  user: null,
  yaazUser: null,
  setTenant: () => {},
  setUser: () => {},
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

interface TenantContextProviderProps extends PropsWithChildren {
  initialTenant?: Tenant | null;
  initialUser?: User | null;
  initialYaazUser?: YaazUser | null;
}

export function TenantContextProvider(props: TenantContextProviderProps) {
  const [tenant, setTenantState] = useState<Tenant | null>(() => props.initialTenant ?? getStoredTenant());
  const [user, setUserState] = useState<User | null>(() => props.initialUser ?? getStoredUser());
  const [yaazUser, setYaazUserState] = useState<YaazUser | null>(() => props.initialYaazUser ?? getStoredYaazUser());

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

  function clearTenant() {
    setTenantState(null);
    setUserState(null);
    deleteCookie(TENANT_COOKIE_KEY);
    deleteCookie(USER_COOKIE_KEY);
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
    <TenantContext.Provider value={{tenant, user, yaazUser, setTenant, setUser, clearTenant, setYaazUser, clearYaazUser}}>
      {props.children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  const {tenant, user, setTenant, setUser, clearTenant} = useContext(TenantContext);
  return {tenant, user, setTenant, setUser, clearTenant};
}

export function useYaazUser() {
  const {yaazUser, setYaazUser, clearYaazUser} = useContext(TenantContext);
  return {yaazUser, setYaazUser, clearYaazUser};
}
