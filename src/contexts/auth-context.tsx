"use client";
import {PropsWithChildren, createContext, useContext} from "react";
import {resetSessionExpiredFlag, useApi} from "../hooks/use-api";
import {useNavigate} from "../hooks/use-navigate";
import {User, useTenant} from "./tenant-context";
import {Tenant} from "../pages-content/tenants/types";

const AuthContext = createContext({
  login: async (login: string, password: string) => {},
  logout: () => {},
});

export function AuthContextProvider(props: PropsWithChildren) {
  const {setTenant, setUser, clearTenant} = useTenant();
  const {navigate} = useNavigate();
  const api = useApi();

  async function login(login: string, password: string) {
    const response = await api.fetch<{success: boolean; tenant: Tenant; user: User}>("POST", "/api/login", {
      body: {email: login, password: password},
    });
    if (response) {
      resetSessionExpiredFlag();
      setTenant(response.tenant);
      setUser(response.user);
      navigate("/home");
    }
  }

  async function logout() {
    await api.fetch("POST", "/api/logout");
    clearTenant();
    navigate("/login");
  }

  return <AuthContext.Provider value={{login, logout}}>{props.children}</AuthContext.Provider>;
}

export function useAuth() {
  const {login, logout} = useContext(AuthContext);
  return {login, logout};
}
