"use client";
import {PropsWithChildren, createContext, useContext} from "react";
import {resetSessionExpiredFlag, useApi} from "../hooks/use-api";
import {useNavigate} from "../hooks/use-navigate";
import {User, YaazUser, useTenant, useYaazUser} from "./tenant-context";
import {Tenant} from "../pages-content/tenants/types";

const AuthContext = createContext({
  login: async (_login: string, _password: string) => {},
  logout: () => {},
  yaazLogin: async (_login: string, _password: string) => {},
  yaazLogout: () => {},
});

export function AuthContextProvider(props: PropsWithChildren) {
  const {setTenant, setUser, clearTenant} = useTenant();
  const {setYaazUser, clearYaazUser} = useYaazUser();
  const {navigate} = useNavigate();
  const api = useApi();

  async function login(login: string, password: string) {
    const response = await api.fetch<{success: boolean; tenant: Tenant; user: User}>("POST", "/api/login", {
      body: {email: login, password: password},
      hideLoader: true,
    });
    if (response) {
      resetSessionExpiredFlag();
      setTenant(response.tenant);
      setUser(response.user);
      navigate("/dashboard");
    }
  }

  async function logout() {
    await api.fetch("POST", "/api/logout");
    clearTenant();
    navigate("/login");
  }

  async function yaazLogin(login: string, password: string) {
    const response = await api.fetch<{success: boolean; user: YaazUser}>("POST", "/api/yaaz/login", {
      body: {email: login, password: password},
      hideLoader: true,
    });
    if (response) {
      setYaazUser(response.user);
      navigate("/yaaz/tenants");
    }
  }

  async function yaazLogout() {
    await api.fetch("POST", "/api/yaaz/logout");
    clearYaazUser();
    navigate("/yaaz/login");
  }

  return <AuthContext.Provider value={{login, logout, yaazLogin, yaazLogout}}>{props.children}</AuthContext.Provider>;
}

export function useAuth() {
  const {login, logout} = useContext(AuthContext);
  return {login, logout};
}

export function useYaazAuth() {
  const {yaazLogin, yaazLogout} = useContext(AuthContext);
  return {login: yaazLogin, logout: yaazLogout};
}
