import ptBR from "@/src/locales/pt-BR.json";
import {flattenObject} from "@/src/utils/flatten-object";

const translations = flattenObject(ptBR);

export function serverTranslate(key: string, vars?: Record<string, string>): string {
  let result = translations[key] ?? key;
  if (vars) {
    Object.entries(vars).forEach(([varKey, varValue]) => {
      result = result.replace(new RegExp(`{{${varKey}}}`, "g"), varValue);
    });
  }
  return result;
}
