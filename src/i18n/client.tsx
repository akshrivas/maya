"use client";

import { createContext, useContext } from "react";
import { getDictionary, type Lang } from "./index";

const LangContext = createContext<Lang>("en");

export function I18nProvider({ lang, children }: { lang: Lang; children: React.ReactNode }) {
  return <LangContext.Provider value={lang}>{children}</LangContext.Provider>;
}

/** Use inside client components: const { t, lang } = useT(); */
export function useT() {
  const lang = useContext(LangContext);
  return { lang, t: getDictionary(lang) };
}
