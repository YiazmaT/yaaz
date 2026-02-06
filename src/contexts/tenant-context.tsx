"use client";
import {PropsWithChildren, createContext, useContext, useEffect, useState} from "react";
import {Tenant} from "../pages-content/tenants/types";

const TENANT_STORAGE_KEY = "tenant";
const USER_STORAGE_KEY = "user";

export interface User {
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

function getStoredTenant(): Tenant | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(TENANT_STORAGE_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored) as Tenant;
  } catch {
    return null;
  }
}

function getStoredUser(): User | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(USER_STORAGE_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored) as User;
  } catch {
    return null;
  }
}

export function TenantContextProvider(props: PropsWithChildren) {
  const [tenant, setTenantState] = useState<Tenant | null>(null);
  const [user, setUserState] = useState<User | null>(null);

  useEffect(() => {
    const storedTenant = getStoredTenant();
    if (storedTenant) {
      setTenantState(storedTenant);
    }
    const storedUser = getStoredUser();
    if (storedUser) {
      setUserState(storedUser);
    }
  }, []);

  function setTenant(newTenant: Tenant | null) {
    setTenantState(newTenant);
    if (newTenant) {
      localStorage.setItem(TENANT_STORAGE_KEY, JSON.stringify(newTenant));
    } else {
      localStorage.removeItem(TENANT_STORAGE_KEY);
    }
  }

  function setUser(newUser: User | null) {
    setUserState(newUser);
    if (newUser) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser));
    } else {
      localStorage.removeItem(USER_STORAGE_KEY);
    }
  }

  function clearTenant() {
    setTenantState(null);
    setUserState(null);
    localStorage.removeItem(TENANT_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
  }

  return <TenantContext.Provider value={{tenant, user, setTenant, setUser, clearTenant}}>{props.children}</TenantContext.Provider>;
}

export function useTenant() {
  const {tenant, user, setTenant, setUser, clearTenant} = useContext(TenantContext);
  return {tenant, user, setTenant, setUser, clearTenant};
}
