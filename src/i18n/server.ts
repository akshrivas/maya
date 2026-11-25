import "server-only";
import { cookies } from "next/headers";
import { DEFAULT_LANG, LANG_COOKIE, getDictionary, isLang, type Lang } from "./index";

/** Reads the visitor's chosen language from a cookie (server side). */
export async function getLang(): Promise<Lang> {
  const value = (await cookies()).get(LANG_COOKIE)?.value;
  return isLang(value) ? value : DEFAULT_LANG;
}

export async function getServerDict() {
  const lang = await getLang();
  return { lang, t: getDictionary(lang) };
}
