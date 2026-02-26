"use client";
import ptBRJSON from "@/src/locales/pt-BR.json";
import {flattenObject} from "@/src/utils/flatten-object";
import {PropsWithChildren, createContext, useContext, useState} from "react";
import {setLocale} from "yup";
import {pt_BR} from "../yup-locales";

setLocale(pt_BR);

const TranslationContext = createContext({
  translate: (key?: string, vars?: Record<string, string>) => key ?? "",
});

export function TranslationContextProvider(props: PropsWithChildren) {
  const [ptBR, setPtBR] = useState(flattenObject(ptBRJSON));

  function translate(key?: string, vars?: Record<string, string>) {
    if (!key) return "";
    let result = ptBR[key] ?? key;
    if (vars) {
      Object.entries(vars).forEach(([varKey, varValue]) => {
        result = result.replace(new RegExp(`{{${varKey}}}`, "g"), varValue);
      });
    }
    return result;
  }

  return <TranslationContext.Provider value={{translate}}>{props.children}</TranslationContext.Provider>;
}

export function useTranslate() {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error("useTranslate must be used within a TranslationProvider");
  }

  function handleTranslate(key?: string, vars?: Record<string, string>) {
    if (!context.translate) return "";
    return context.translate(key, vars);
  }

  return {translate: handleTranslate};
}
