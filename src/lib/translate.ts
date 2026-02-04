import ptBRJSON from "@/src/locales/pt-BR.json";
import {flattenObject} from "@/src/utils/flatten-object";

const translations = flattenObject(ptBRJSON);

export function translate(key?: string): string {
  if (!key) return "";
  return translations[key] ?? key;
}
