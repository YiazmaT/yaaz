"use client";
import {PropsWithChildren, createContext, useContext, useState} from "react";
import {Tenant} from "../pages-content/tenants/types";

interface TenantContextValue {
  tenant: Tenant | null;
  setTenant: (tenant: Tenant | null) => void;
}

const TenantContext = createContext<TenantContextValue>({
  tenant: null,
  setTenant: () => {},
});

export function TenantContextProvider(props: PropsWithChildren) {
  const [tenant, setTenant] = useState<Tenant | null>(null);

  return <TenantContext.Provider value={{tenant, setTenant}}>{props.children}</TenantContext.Provider>;
}

export function useTenant() {
  const {tenant, setTenant} = useContext(TenantContext);
  return {tenant, setTenant};
}
