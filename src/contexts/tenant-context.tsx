"use client";
import {PropsWithChildren, createContext, useContext, useState} from "react";
import {Tenant} from "../pages-content/tenants/types";

const TENANT_COOKIE_KEY = "tenant";
const USER_COOKIE_KEY = "user";
const COOKIE_MAX_AGE = 31536000; // 1 year

export interface User {
  id: string;
  name: string;
}

interface TenantContextValue {
  tenant: Tenant | null;
  user: User | null;
  setTenant: (tenant: Tenant | null) => void;
  setUser: (user: User | null) => void;
  clearTenant: () => void;
}

const TenantContext = createContext<TenantContextValue>({
  tenant: null,
  user: null,
  setTenant: () => {},
  setUser: () => {},
  clearTenant: () => {},
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

interface TenantContextProviderProps extends PropsWithChildren {
  initialTenant?: Tenant | null;
  initialUser?: User | null;
}

export function TenantContextProvider(props: TenantContextProviderProps) {
  const [tenant, setTenantState] = useState<Tenant | null>(
    () => props.initialTenant ?? getStoredTenant()
  );
  const [user, setUserState] = useState<User | null>(
    () => props.initialUser ?? getStoredUser()
  );

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

  return <TenantContext.Provider value={{tenant, user, setTenant, setUser, clearTenant}}>{props.children}</TenantContext.Provider>;
}

export function useTenant() {
  const {tenant, user, setTenant, setUser, clearTenant} = useContext(TenantContext);
  return {tenant, user, setTenant, setUser, clearTenant};
}
