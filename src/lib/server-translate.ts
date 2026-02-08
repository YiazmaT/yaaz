import ptBR from "@/src/locales/pt-BR.json";
import {flattenObject} from "@/src/utils/flatten-object";

const translations = flattenObject(ptBR);

export function serverTranslate(key: string): string {
  return translations[key] ?? key;
}
