"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { authedFetch, useAuth } from "@/components/auth/AuthProvider";
import { firebase } from "@/lib/firebase/client";
import { useT } from "@/i18n/client";
import { COUNTRIES, DEFAULT_COUNTRY } from "@/config/countries";
import { step1Schema, fieldErrors, LIMITS } from "@/lib/profile/schema";
import { errorText } from "@/lib/errors";
import { Field } from "@/components/ui/Field";
import { LinkedText } from "@/components/ui/LinkedText";
import { ProfessionPicker } from "@/components/ui/ProfessionPicker";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Logo } from "@/components/Logo";

type PinState = "idle" | "loading" | "found" | "notFound";

export default function OnboardingPage() {
  const { t, lang } = useT();
  const router = useRouter();
  const { user, loading } = useAuth();
  const country = DEFAULT_COUNTRY;

  const [form, setForm] = useState({
    name: "",
    professionId: "",
    pincode: "",
    state: "",
    city: "",
    area: "",
    intro: "",
    phone: "",
    acceptTerms: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [busy, setBusy] = useState(false);
  const [checking, setChecking] = useState(true);
  const [pin, setPin] = useState<PinState>("idle");
  const [areas, setAreas] = useState<string[]>([]);

  const phoneFromLogin = user?.phoneNumber ?? "";

  // Must be logged in; if a page already exists, go to the dashboard instead.
  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    getDoc(doc(firebase().db, "profiles", user.uid))
      .then((snap) => (snap.exists() ? router.replace("/dashboard") : setChecking(false)))
      .catch(() => setChecking(false));
    setForm((f) => ({
      ...f,
      name: f.name || user.displayName || "",
      phone: f.phone || (user.phoneNumber ? user.phoneNumber.replace(COUNTRIES[country].dial, "") : ""),
    }));
  }, [user, loading, router, country]);

  // Pincode autofill
  useEffect(() => {
    if (!COUNTRIES[country].hasPincode || !/^[1-9]\d{5}$/.test(form.pincode)) {
      setPin("idle");
      return;
    }
    const ctrl = new AbortController();
    setPin("loading");
    fetch(`/api/pincode/${form.pincode}`, { signal: ctrl.signal })
      .then(async (res) => {
        if (!res.ok) throw new Error();
        const data = (await res.json()) as { state: string; city: string; areas: string[] };
        setForm((f) => ({ ...f, state: data.state, city: data.city, area: f.area }));
        setAreas(data.areas);
        setPin("found");
      })
      .catch((e) => {
        if ((e as Error).name !== "AbortError") setPin("notFound");
      });
    return () => ctrl.abort();
  }, [form.pincode, country]);

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: "" }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    const payload = { ...form, country };
    const parsed = step1Schema.safeParse(payload);
    if (!parsed.success) {
      const errs = fieldErrors(parsed.error);
      setErrors(errs);
      document.getElementById(Object.keys(errs)[0])?.focus();
      return;
    }
    setBusy(true);
    try {
      const res = await authedFetch("/api/profile", { method: "POST", body: JSON.stringify({ ...payload, lang }) });
      const json = await res.json();
      if (res.ok || json.error === "exists") {
        router.replace("/dashboard?welcome=1");
        return;
      }
      if (json.fields) setErrors(json.fields);
      setFormError(json.error === "handleTaken" ? "generic" : json.error || "generic");
    } catch {
      setFormError("network");
    }
    setBusy(false);
  }

  if (loading || checking) {
    return <p className="p-10 text-center text-muted">{t.common.loading}</p>;
  }

  return (
    <main className="mx-auto max-w-md px-4 pb-16 pt-5">
      <div className="flex items-center justify-between">
        <Logo />
        <LanguageSwitcher />
      </div>

      <p className="mt-8 text-xs font-semibold uppercase tracking-wide text-brand-700">{t.onboarding.stepLabel}</p>
      <h1 className="mt-1 font-serif text-3xl leading-tight">{t.onboarding.title}</h1>
      <p className="mt-2 text-muted">{t.onboarding.sub}</p>

      <form onSubmit={submit} noValidate className="mt-7 space-y-5">
        <Field id="name" label={t.onboarding.name} error={errors.name}>
          <input
            id="name"
            className="input"
            autoComplete="name"
            placeholder={t.onboarding.namePlaceholder}
            value={form.name}
            maxLength={LIMITS.name}
            onChange={(e) => set("name", e.target.value)}
          />
        </Field>

        <Field id="professionId" label={t.onboarding.profession} error={errors.professionId}>
          <ProfessionPicker
            id="professionId"
            value={form.professionId}
            onChange={(v) => set("professionId", v)}
            invalid={!!errors.professionId}
          />
        </Field>

        <Field
          id="pincode"
          label={t.onboarding.pincode}
          error={errors.pincode}
          hint={
            pin === "loading"
              ? t.onboarding.pincodeLooking
              : pin === "notFound"
                ? t.onboarding.pincodeNotFound
                : t.onboarding.pincodeHint
          }
        >
          <input
            id="pincode"
            className="input"
            inputMode="numeric"
            autoComplete="postal-code"
            maxLength={6}
            placeholder="452010"
            value={form.pincode}
            onChange={(e) => set("pincode", e.target.value.replace(/\D/g, ""))}
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field id="city" label={t.onboarding.city} error={errors.city}>
            <input
              id="city"
              className="input"
              autoComplete="address-level2"
              value={form.city}
              maxLength={LIMITS.place}
              onChange={(e) => set("city", e.target.value)}
            />
          </Field>
          <Field id="state" label={t.onboarding.state} error={errors.state}>
            <input
              id="state"
              className="input"
              autoComplete="address-level1"
              value={form.state}
              maxLength={LIMITS.place}
              onChange={(e) => set("state", e.target.value)}
            />
          </Field>
        </div>

        <Field id="area" label={t.onboarding.area} error={errors.area} optional>
          <input
            id="area"
            className="input"
            list="area-options"
            placeholder={t.onboarding.areaPlaceholder}
            value={form.area}
            maxLength={LIMITS.place}
            onChange={(e) => set("area", e.target.value)}
          />
          <datalist id="area-options">
            {areas.map((a) => (
              <option key={a} value={a} />
            ))}
          </datalist>
        </Field>

        <Field
          id="intro"
          label={t.onboarding.intro}
          hint={t.onboarding.introHint}
          error={errors.intro}
          count={{ value: form.intro.length, max: LIMITS.intro }}
        >
          <textarea
            id="intro"
            className="input min-h-24 resize-none"
            placeholder={t.onboarding.introPlaceholder}
            value={form.intro}
            maxLength={LIMITS.intro}
            onChange={(e) => set("intro", e.target.value)}
          />
        </Field>

        <Field id="phone" label={t.onboarding.phone} hint={t.onboarding.phoneHint} error={errors.phone}>
          <div className="flex gap-2">
            <span className="input w-auto shrink-0 bg-brand-50 px-3 text-muted">{COUNTRIES[country].dial}</span>
            <input
              id="phone"
              type="tel"
              inputMode="numeric"
              autoComplete="tel-national"
              className="input"
              value={form.phone}
              readOnly={!!phoneFromLogin}
              maxLength={16}
              onChange={(e) => set("phone", e.target.value)}
            />
          </div>
        </Field>

        <div>
          <label className="flex items-start gap-3 text-sm">
            <input
              id="acceptTerms"
              type="checkbox"
              className="mt-0.5 h-5 w-5 shrink-0 accent-brand-600"
              checked={form.acceptTerms}
              onChange={(e) => set("acceptTerms", e.target.checked)}
            />
            <span>
              <LinkedText
                text={t.onboarding.acceptTerms}
                links={{
                  terms: { href: "/terms", label: t.legal.termsTitle },
                  privacy: { href: "/privacy", label: t.legal.privacyTitle },
                }}
              />
            </span>
          </label>
          {errors.acceptTerms && (
            <p className="mt-1 text-sm text-red-600" role="alert">
              {errorText(t, errors.acceptTerms)}
            </p>
          )}
        </div>

        {formError && (
          <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {errorText(t, formError)}
          </p>
        )}

        <button type="submit" className="btn-primary w-full text-lg" disabled={busy}>
          {busy ? t.onboarding.submitting : `${t.onboarding.submit} 🚀`}
        </button>
      </form>
    </main>
  );
}
