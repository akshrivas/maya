import { en, type Dict } from "./en";
import { hi } from "./hi";

export const LANGUAGES = {
  en: { label: "English", dict: en },
  hi: { label: "हिन्दी", dict: hi },
} as const;

export type Lang = keyof typeof LANGUAGES;
export const DEFAULT_LANG: Lang = "en";
export const LANG_COOKIE = "maya_lang";

export function isLang(value: unknown): value is Lang {
  return typeof value === "string" && value in LANGUAGES;
}

export function getDictionary(lang: Lang): Dict {
  return LANGUAGES[lang].dict;
}

/** Fill {placeholders} in a string: fmt("Hi {name}", { name: "Asha" }) */
export function fmt(text: string, values: Record<string, string | number>): string {
  return text.replace(/\{(\w+)\}/g, (_, key) => String(values[key] ?? `{${key}}`));
}

export type { Dict };
