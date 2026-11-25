"use client";

import { useState } from "react";
import { authedFetch } from "@/components/auth/AuthProvider";
import { useT } from "@/i18n/client";
import { errorText } from "@/lib/errors";
import { isValidHandle, slugify } from "@/lib/profile/handle";
import { SITE_HOST } from "@/lib/site";

/** Change the page link. The server checks it is free and releases the old one. */
export function HandleEditor({ handle, onChanged }: { handle: string; onChanged: (h: string) => void }) {
  const { t } = useT();
  const [value, setValue] = useState(handle);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function save() {
    setError("");
    setDone(false);
    const clean = slugify(value);
    setValue(clean);
    if (!isValidHandle(clean)) return setError("invalidHandle");
    if (clean === handle) return;
    setBusy(true);
    try {
      const res = await authedFetch("/api/profile/handle", { method: "POST", body: JSON.stringify({ handle: clean }) });
      const json = await res.json();
      if (!res.ok) setError(json.error || "generic");
      else {
        onChanged(json.handle);
        setDone(true);
      }
    } catch {
      setError("network");
    }
    setBusy(false);
  }

  return (
    <div>
      <label htmlFor="handle" className="label">
        {t.dash.linkLabel}
      </label>
      <div className="flex items-stretch overflow-hidden rounded-xl border border-line bg-white focus-within:border-brand-500">
        <span className="flex items-center bg-brand-50 px-3 text-sm text-muted">{SITE_HOST}/</span>
        <input
          id="handle"
          className="min-w-0 flex-1 px-3 py-3 outline-none"
          value={value}
          autoCapitalize="none"
          autoCorrect="off"
          onChange={(e) => setValue(e.target.value.toLowerCase())}
        />
      </div>
      <p className="mt-1 text-sm text-muted">{t.dash.linkHint}</p>
      {error && <p className="mt-1 text-sm text-red-600">{errorText(t, error)}</p>}
      {done && <p className="mt-1 text-sm text-brand-700">{t.common.saved} ✓</p>}
      <button type="button" className="btn-secondary mt-3" onClick={save} disabled={busy || value === handle}>
        {busy ? t.common.saving : t.dash.linkSave}
      </button>
    </div>
  );
}
