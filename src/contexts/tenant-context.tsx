"use client";
import {PropsWithChildren, createContext, useContext, useEffect, useState} from "react";
import {Tenant} from "../pages-content/tenants/types";

const TENANT_STORAGE_KEY = "tenant";

interface TenantContextValue {
  tenant: Tenant | null;
  setTenant: (tenant: Tenant | null) => void;
  clearTenant: () => void;
}

const TenantContext = createContext<TenantContextValue>({
  tenant: null,
  setTenant: () => {},
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

export function TenantContextProvider(props: PropsWithChildren) {
  const [tenant, setTenantState] = useState<Tenant | null>(null);

  useEffect(() => {
    const stored = getStoredTenant();
    if (stored) {
      setTenantState(stored);
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

  function clearTenant() {
    setTenantState(null);
    localStorage.removeItem(TENANT_STORAGE_KEY);
  }

  return <TenantContext.Provider value={{tenant, setTenant, clearTenant}}>{props.children}</TenantContext.Provider>;
}

export function useTenant() {
  const {tenant, setTenant, clearTenant} = useContext(TenantContext);
  return {tenant, setTenant, clearTenant};
}
