"use client";

import { useState } from "react";
import { authedFetch } from "@/components/auth/AuthProvider";
import { useT } from "@/i18n/client";
import { errorText } from "@/lib/errors";
import type { Profile } from "@/lib/profile/types";
import type { Draft } from "./draft";

/** "✨ Write my About with AI" — fills the About box; the user can edit before saving. */
export function AboutWriter({ profile, draft, onText }: { profile: Profile; draft: Draft; onText: (t: string) => void }) {
  const { t, lang } = useT();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function generate() {
    if (draft.about.trim() && !window.confirm(t.dash.aiReplaceConfirm)) return;
    setBusy(true);
    setError("");
    try {
      const years = draft.yearsExperience ? Number(draft.yearsExperience) : null;
      const res = await authedFetch("/api/about", {
        method: "POST",
        body: JSON.stringify({
          name: draft.name,
          professionId: draft.professionId,
          city: draft.city,
          area: draft.area,
          intro: draft.intro || profile.intro,
          yearsExperience: Number.isFinite(years) ? years : null,
          services: draft.services.map((s) => s.name).filter(Boolean),
          languages: draft.languages,
          extra: draft.extra,
          lang,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "aiUnavailable");
      onText(json.about);
      setDone(true);
    } catch (e) {
      setError((e as Error).message === "aiLimit" ? "aiLimit" : "aiUnavailable");
    }
    setBusy(false);
  }

  return (
    <div className="rounded-xl border border-accent-400/60 bg-accent-400/10 p-3">
      <p className="text-sm">{t.dash.aiExplain}</p>
      <button type="button" onClick={generate} disabled={busy} className="btn mt-2 bg-ink px-4 py-2 text-sm text-white">
        {busy ? t.dash.aiWriting : `✨ ${t.dash.aiWrite}`}
      </button>
      {done && !busy && <p className="mt-2 text-sm text-brand-700">{t.dash.aiDone}</p>}
      {error && <p className="mt-2 text-sm text-red-600">{errorText(t, error)}</p>}
    </div>
  );
}
