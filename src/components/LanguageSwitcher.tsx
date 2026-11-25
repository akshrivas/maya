"use client";

import { useRouter } from "next/navigation";
import { LANGUAGES, LANG_COOKIE, type Lang } from "@/i18n";
import { useT } from "@/i18n/client";

export function LanguageSwitcher({ className = "" }: { className?: string }) {
  const { lang, t } = useT();
  const router = useRouter();

  function change(next: Lang) {
    document.cookie = `${LANG_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
    router.refresh();
  }

  return (
    <label className={`inline-flex items-center gap-1 text-sm ${className}`}>
      <span className="sr-only">{t.common.language}</span>
      <select
        value={lang}
        onChange={(e) => change(e.target.value as Lang)}
        className="rounded-lg border border-line bg-white px-2 py-1.5 text-sm"
      >
        {(Object.keys(LANGUAGES) as Lang[]).map((code) => (
          <option key={code} value={code}>
            {LANGUAGES[code].label}
          </option>
        ))}
      </select>
    </label>
  );
}
