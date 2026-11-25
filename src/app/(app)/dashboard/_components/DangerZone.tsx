"use client";

import { useState } from "react";
import { authedFetch, logout } from "@/components/auth/AuthProvider";
import { useT } from "@/i18n/client";
import { fmt } from "@/i18n";
import { errorText } from "@/lib/errors";

/** "Delete my account and data" — permanently removes the page, photos, private data and login. */
export function DangerZone({ handle }: { handle: string }) {
  const { t } = useT();
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function del() {
    setBusy(true);
    setError("");
    try {
      const res = await authedFetch("/api/account", { method: "DELETE" });
      if (!res.ok) throw new Error();
      await logout().catch(() => {});
      // Full page load (not an in-app route change) so nothing tries to send the
      // now-logged-out user back to the login page first.
      window.location.replace("/?deleted=1");
    } catch {
      setError("generic");
      setBusy(false);
    }
  }

  return (
    <div>
      <p className="text-sm text-muted">{t.account.deleteExplain}</p>
      {!open ? (
        <button type="button" onClick={() => setOpen(true)} className="btn mt-3 border border-red-200 bg-white text-red-700 hover:bg-red-50">
          {t.account.delete}
        </button>
      ) : (
        <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-4">
          <label htmlFor="confirm-delete" className="text-sm font-medium text-red-800">
            {fmt(t.account.confirmPrompt, { handle })}
          </label>
          <input
            id="confirm-delete"
            className="input mt-2"
            value={confirm}
            autoCapitalize="none"
            onChange={(e) => setConfirm(e.target.value)}
          />
          {error && <p className="mt-2 text-sm text-red-700">{errorText(t, error)}</p>}
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={del}
              disabled={busy || confirm.trim().toLowerCase() !== handle}
              className="btn bg-red-600 text-white hover:bg-red-700"
            >
              {busy ? t.account.deleting : t.account.confirmDelete}
            </button>
            <button type="button" onClick={() => setOpen(false)} className="btn-secondary">
              {t.common.cancel}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
