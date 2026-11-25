"use client";

import { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { firebase } from "@/lib/firebase/client";
import { useT } from "@/i18n/client";
import { errorText } from "@/lib/errors";
import { fieldErrors, verificationSchema } from "@/lib/profile/schema";
import type { Verification as V } from "@/lib/profile/types";
import { Field } from "@/components/ui/Field";

/**
 * Step 3 — verification details for a badge. Stored privately (users/{uid}), never shown on
 * the public page. Maya's team reviews them and turns the badge on by hand.
 * Aadhaar is deliberately NOT collected until the legal review (see README).
 */
export function VerificationForm({ uid, initial, verified }: { uid: string; initial: V | null; verified: boolean }) {
  const { t } = useT();
  const [form, setForm] = useState({
    pan: initial?.pan ?? "",
    businessIdType: initial?.businessIdType ?? "",
    businessId: initial?.businessId ?? "",
    licenceName: initial?.licenceName ?? "",
    licenceNumber: initial?.licenceNumber ?? "",
  });
  const [status, setStatus] = useState(initial?.status ?? null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    setError("");
    const parsed = verificationSchema.safeParse(form);
    if (!parsed.success) return setErrors(fieldErrors(parsed.error));
    const d = parsed.data;
    if (!d.pan && !d.businessId && !d.licenceNumber) return setErrors({ pan: "verificationEmpty" });
    setErrors({});
    setBusy(true);
    try {
      await updateDoc(doc(firebase().db, "users", uid), {
        verification: { ...d, status: "submitted", submittedAt: Date.now() },
      });
      setStatus("submitted");
    } catch {
      setError("generic");
    }
    setBusy(false);
  }

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <div className="space-y-4">
      <p className="rounded-xl bg-brand-50 p-3 text-sm">🔒 {t.verify.privacyNote}</p>
      {verified ? (
        <p className="font-semibold text-brand-700">✓ {t.verify.statusVerified}</p>
      ) : status === "submitted" ? (
        <p className="font-semibold text-accent-500">⏳ {t.verify.statusSubmitted}</p>
      ) : status === "rejected" ? (
        <p className="font-semibold text-red-600">{t.verify.statusRejected}</p>
      ) : null}

      <Field id="pan" label={t.verify.pan} error={errors.pan} optional>
        <input id="pan" className="input uppercase" maxLength={10} value={form.pan} onChange={set("pan")} placeholder="ABCDE1234F" />
      </Field>
      <div className="grid grid-cols-[auto_1fr] gap-2">
        <Field id="businessIdType" label={t.verify.businessIdType} optional>
          <select id="businessIdType" className="input" value={form.businessIdType} onChange={set("businessIdType")}>
            <option value="">—</option>
            <option value="gst">GST</option>
            <option value="udyam">Udyam</option>
            <option value="shop_licence">{t.verify.shopLicence}</option>
          </select>
        </Field>
        <Field id="businessId" label={t.verify.businessId} error={errors.businessId}>
          <input id="businessId" className="input" maxLength={40} value={form.businessId} onChange={set("businessId")} />
        </Field>
      </div>
      <Field id="licenceName" label={t.verify.licenceName} hint={t.verify.licenceHint} optional>
        <input id="licenceName" className="input" maxLength={80} value={form.licenceName} onChange={set("licenceName")} placeholder={t.verify.licencePlaceholder} />
      </Field>
      <Field id="licenceNumber" label={t.verify.licenceNumber} error={errors.licenceNumber}>
        <input id="licenceNumber" className="input" maxLength={40} value={form.licenceNumber} onChange={set("licenceNumber")} />
      </Field>
      {error && <p className="text-sm text-red-600">{errorText(t, error)}</p>}
      <button type="button" className="btn-secondary" onClick={submit} disabled={busy}>
        {busy ? t.common.saving : t.verify.submit}
      </button>
    </div>
  );
}
