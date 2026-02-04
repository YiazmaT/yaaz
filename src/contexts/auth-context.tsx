"use client";
import {PropsWithChildren, createContext, useContext} from "react";
import {resetSessionExpiredFlag, useApi} from "../hooks/use-api";
import {useNavigate} from "../hooks/use-navigate";

const AuthContext = createContext({
  login: async (login: string, password: string) => {},
  logout: () => {},
});

export function AuthContextProvider(props: PropsWithChildren) {
  const {navigate} = useNavigate();
  const api = useApi();

  async function login(login: string, password: string) {
    const response = await api.fetch("POST", "/api/login", {
      body: {email: login, password: password},
    });
    if (response) {
      resetSessionExpiredFlag();
      navigate("/home");
    }
  }

  async function logout() {
    await api.fetch("POST", "/api/logout");
    navigate("/login");
  }

  return <AuthContext.Provider value={{login, logout}}>{props.children}</AuthContext.Provider>;
}

export function useAuth() {
  const {login, logout} = useContext(AuthContext);
  return {login, logout};
}
