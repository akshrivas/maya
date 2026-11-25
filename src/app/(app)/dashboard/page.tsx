"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { logout, useAuth } from "@/components/auth/AuthProvider";
import { firebase } from "@/lib/firebase/client";
import { useT } from "@/i18n/client";
import { fmt } from "@/i18n";
import { COUNTRIES } from "@/config/countries";
import { professionCategory, professionName } from "@/config/professions";
import { SPOKEN_LANGUAGES } from "@/config/languages";
import { LIMITS } from "@/lib/profile/schema";
import { errorText } from "@/lib/errors";
import { publicPageUrl } from "@/lib/site";
import type { PrivateUser, Profile, StoredImage } from "@/lib/profile/types";
import { Field } from "@/components/ui/Field";
import { ProfessionPicker } from "@/components/ui/ProfessionPicker";
import { ShareSheet } from "@/components/page/ShareButton";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Logo } from "@/components/Logo";
import { CompletionBar } from "./_components/Completion";
import { ImageField, PortfolioField } from "./_components/ImageField";
import { TemplatePicker } from "./_components/TemplatePicker";
import { HandleEditor } from "./_components/HandleEditor";
import { VerificationForm } from "./_components/Verification";
import { DangerZone } from "./_components/DangerZone";
import { AboutWriter } from "./_components/AboutWriter";
import { fromDraft, toDraft, type Draft } from "./_components/draft";

export default function DashboardPage() {
  return (
    <Suspense>
      <Dashboard />
    </Suspense>
  );
}

function Dashboard() {
  const { t, lang } = useT();
  const router = useRouter();
  const welcome = useSearchParams().get("welcome") === "1";
  const { user, loading } = useAuth();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [privateUser, setPrivateUser] = useState<PrivateUser | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [sharing, setSharing] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) return router.replace("/login");
    const { db } = firebase();
    Promise.all([getDoc(doc(db, "profiles", user.uid)), getDoc(doc(db, "users", user.uid))]).then(([p, u]) => {
      if (!p.exists()) return router.replace("/onboarding");
      const prof = p.data() as Profile;
      setProfile(prof);
      setDraft(toDraft(prof));
      setPrivateUser(u.exists() ? (u.data() as PrivateUser) : null);
    });
  }, [user, loading, router]);

  const dirty = useMemo(() => !!(profile && draft && JSON.stringify(toDraft(profile)) !== JSON.stringify(draft)), [profile, draft]);

  const set = useCallback(<K extends keyof Draft>(key: K, value: Draft[K]) => {
    setDraft((d) => (d ? { ...d, [key]: value } : d));
    setErrors((e) => (e[key] ? { ...e, [key]: "" } : e));
    setSaveState("idle");
  }, []);

  /** Save some fields right away (used by photo uploads and the template picker). */
  const persist = useCallback(
    async (fields: Partial<Pick<Profile, "photo" | "cover" | "portfolio" | "template">>) => {
      if (!user) return;
      const updatedAt = Date.now();
      await updateDoc(doc(firebase().db, "profiles", user.uid), { ...fields, updatedAt });
      setProfile((p) => (p ? { ...p, ...fields, updatedAt } : p));
      setDraft((d) => (d ? { ...d, ...fields } : d));
    },
    [user],
  );

  async function save() {
    if (!user || !profile || !draft) return;
    const result = fromDraft(draft, profile);
    if (!result.ok) {
      setErrors(result.errors);
      setSaveState("error");
      const first = Object.keys(result.errors)[0];
      const section = sectionForField(first);
      if (section) setOpenSection(section);
      setTimeout(() => document.getElementById(first.split(".")[0])?.focus(), 50);
      return;
    }
    setSaveState("saving");
    try {
      const updatedAt = Date.now();
      await updateDoc(doc(firebase().db, "profiles", user.uid), { ...result.data, updatedAt });
      const next = { ...profile, ...result.data, updatedAt } as Profile;
      setProfile(next);
      setDraft(toDraft(next));
      setErrors({});
      setSaveState("saved");
    } catch (e) {
      console.error(e);
      setSaveState("error");
      setErrors({ _form: "generic" });
    }
  }

  function openAndScroll(id: string) {
    setOpenSection(id);
    setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  }

  if (!profile || !draft || !user) {
    return <p className="p-10 text-center text-muted">{t.common.loading}</p>;
  }

  const url = publicPageUrl(profile.handle);
  const dial = COUNTRIES[profile.country].dial;
  const category = professionCategory(draft.professionId);
  const S = (id: string, title: string, children: React.ReactNode, subtitle?: string) => (
    <EditSection id={id} title={title} subtitle={subtitle} open={openSection === id} onToggle={() => setOpenSection(openSection === id ? null : id)}>
      {children}
    </EditSection>
  );

  return (
    <div className="min-h-dvh pb-32">
      <header className="sticky top-0 z-20 border-b border-line/70 bg-paper/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4">
          <Link href="/">
            <Logo />
          </Link>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <button
              type="button"
              onClick={() => logout().then(() => router.replace("/"))}
              className="rounded-lg px-2 py-1.5 text-sm text-muted hover:text-ink"
            >
              {t.common.logout}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl space-y-4 px-4 pt-5">
        {welcome && (
          <section className="rounded-2xl bg-brand-700 p-5 text-white">
            <p className="text-2xl">🎉</p>
            <h1 className="mt-1 text-xl font-bold">{t.dash.welcomeTitle}</h1>
            <p className="mt-1 text-white/85">{t.dash.welcomeBody}</p>
          </section>
        )}

        {/* Your page link + share */}
        <section className="card">
          <p className="text-sm text-muted">{t.dash.yourPage}</p>
          <a data-testid="page-link" href={`/${profile.handle}`} target="_blank" className="mt-1 block break-all text-lg font-semibold text-brand-700 underline">
            {url.replace(/^https?:\/\//, "")}
          </a>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <a href={`/${profile.handle}`} target="_blank" className="btn-secondary">
              {t.dash.viewPage}
            </a>
            <button type="button" className="btn-primary" onClick={() => setSharing(true)}>
              {t.dash.sharePage}
            </button>
          </div>
          <p className="mt-3 text-xs text-muted">{t.dash.shareTip}</p>
        </section>
        {sharing && (
          <ShareSheet
            url={url}
            title={profile.name}
            text={fmt(t.page.shareText, { name: profile.name, profession: professionName(profile.professionId, lang), city: profile.city })}
            fileName={`maya-${profile.handle}-qr`}
            onClose={() => setSharing(false)}
          />
        )}

        <CompletionBar profile={profile} onOpen={openAndScroll} />

        <h2 className="px-1 pt-3 text-sm font-semibold uppercase tracking-wide text-muted">{t.dash.editTitle}</h2>

        {S(
          "sec-basics",
          t.dash.secBasics,
          <div className="space-y-4">
            <Field id="name" label={t.onboarding.name} error={errors.name}>
              <input id="name" className="input" value={draft.name} maxLength={LIMITS.name} onChange={(e) => set("name", e.target.value)} />
            </Field>
            <Field id="professionId" label={t.onboarding.profession} error={errors.professionId}>
              <ProfessionPicker id="professionId" value={draft.professionId} onChange={(v) => set("professionId", v)} />
            </Field>
            <Field id="intro" label={t.onboarding.intro} error={errors.intro} count={{ value: draft.intro.length, max: LIMITS.intro }}>
              <textarea id="intro" className="input min-h-20 resize-none" value={draft.intro} maxLength={LIMITS.intro} onChange={(e) => set("intro", e.target.value)} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field id="city" label={t.onboarding.city} error={errors.city}>
                <input id="city" className="input" value={draft.city} maxLength={LIMITS.place} onChange={(e) => set("city", e.target.value)} />
              </Field>
              <Field id="state" label={t.onboarding.state} error={errors.state}>
                <input id="state" className="input" value={draft.state} maxLength={LIMITS.place} onChange={(e) => set("state", e.target.value)} />
              </Field>
              <Field id="area" label={t.onboarding.area} error={errors.area} optional>
                <input id="area" className="input" value={draft.area} maxLength={LIMITS.place} onChange={(e) => set("area", e.target.value)} />
              </Field>
              <Field id="pincode" label={t.onboarding.pincode} error={errors.pincode} optional>
                <input id="pincode" className="input" inputMode="numeric" maxLength={6} value={draft.pincode} onChange={(e) => set("pincode", e.target.value.replace(/\D/g, ""))} />
              </Field>
            </div>
          </div>,
          `${draft.name} · ${professionName(draft.professionId, lang)}`,
        )}

        {S(
          "sec-photos",
          t.dash.secPhotos,
          <div className="space-y-5">
            <ImageField uid={user.uid} kind="photo" label={t.dash.photo} value={draft.photo} onSaved={(img) => persist({ photo: img })} />
            <ImageField uid={user.uid} kind="cover" label={t.dash.cover} shape="wide" value={draft.cover} onSaved={(img) => persist({ cover: img })} />
            <p className="text-xs text-muted">{t.dash.photosSaveNote}</p>
          </div>,
        )}

        {S(
          "sec-about",
          t.dash.secAbout,
          <div className="space-y-3">
            <AboutWriter profile={profile} draft={draft} onText={(text) => set("about", text)} />
            <Field id="about" label={t.dash.aboutLabel} error={errors.about} count={{ value: draft.about.length, max: LIMITS.about }}>
              <textarea id="about" className="input min-h-48" value={draft.about} maxLength={LIMITS.about} onChange={(e) => set("about", e.target.value)} placeholder={t.dash.aboutPlaceholder} />
            </Field>
          </div>,
        )}

        {S(
          "sec-services",
          t.dash.secServices,
          <ServicesEditor draft={draft} set={set} errors={errors} currency={profile.currency} />,
          draft.services.length ? fmt(t.dash.servicesCount, { n: draft.services.length }) : undefined,
        )}

        {S(
          "sec-work",
          t.dash.secWork,
          <div className="space-y-5">
            <PortfolioField uid={user.uid} value={draft.portfolio} max={LIMITS.portfolio} onSaved={(imgs: StoredImage[]) => persist({ portfolio: imgs })} />
            <VideosEditor draft={draft} set={set} errors={errors} />
          </div>,
        )}

        {S(
          "sec-reviews",
          t.dash.secReviews,
          <ReviewsEditor draft={draft} set={set} errors={errors} />,
          draft.testimonials.length ? fmt(t.dash.reviewsCount, { n: draft.testimonials.length }) : t.dash.secReviewsSub,
        )}

        {S(
          "sec-contact",
          t.dash.secContact,
          <div className="space-y-4">
            <Field id="phone" label={t.dash.phone} hint={t.dash.phoneHint} error={errors.phone}>
              <PhoneInput id="phone" dial={dial} value={draft.phone} onChange={(v) => set("phone", v)} />
            </Field>
            <Field id="whatsapp" label={t.dash.whatsapp} hint={t.dash.whatsappHint} error={errors.whatsapp} optional>
              <PhoneInput id="whatsapp" dial={dial} value={draft.whatsapp} onChange={(v) => set("whatsapp", v)} />
            </Field>
            <Field id="email" label={t.page.email} error={errors.email} optional>
              <input id="email" type="email" className="input" autoComplete="email" value={draft.email} onChange={(e) => set("email", e.target.value)} />
            </Field>
            <Field id="website" label={t.page.website} error={errors.website} optional>
              <input id="website" type="url" className="input" placeholder="https://" value={draft.website} onChange={(e) => set("website", e.target.value)} />
            </Field>
            <Field id="instagram" label={t.page.instagram} error={errors.instagram} optional>
              <div className="flex gap-2">
                <span className="input w-auto shrink-0 bg-brand-50 px-3 text-muted">@</span>
                <input id="instagram" className="input" autoCapitalize="none" value={draft.instagram} onChange={(e) => set("instagram", e.target.value)} />
              </div>
            </Field>
          </div>,
        )}

        {S(
          "sec-more",
          t.dash.secMore,
          <div className="space-y-4">
            {category.extraFields.map((f) => (
              <Field key={f.key} id={`extra-${f.key}`} label={f.label[lang] || f.label.en} optional>
                <input
                  id={`extra-${f.key}`}
                  className="input"
                  maxLength={LIMITS.extraValue}
                  placeholder={f.placeholder?.[lang]}
                  value={draft.extra[f.key] ?? ""}
                  onChange={(e) => set("extra", { ...draft.extra, [f.key]: e.target.value })}
                />
              </Field>
            ))}
            <Field id="yearsExperience" label={t.dash.experience} error={errors.yearsExperience} optional>
              <input id="yearsExperience" className="input w-32" inputMode="numeric" maxLength={2} value={draft.yearsExperience} onChange={(e) => set("yearsExperience", e.target.value.replace(/\D/g, ""))} />
            </Field>
            <div>
              <p className="label">
                {t.page.languages} <span className="font-normal text-muted">({t.common.optional})</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {SPOKEN_LANGUAGES.map((l) => {
                  const on = draft.languages.includes(l.code);
                  return (
                    <button
                      key={l.code}
                      type="button"
                      aria-pressed={on}
                      onClick={() =>
                        set("languages", on ? draft.languages.filter((c) => c !== l.code) : [...draft.languages, l.code].slice(0, LIMITS.languages))
                      }
                      className={`rounded-full border px-3 py-1.5 text-sm ${on ? "border-brand-600 bg-brand-600 text-white" : "border-line bg-white"}`}
                    >
                      {l.name}
                    </button>
                  );
                })}
              </div>
            </div>
            <Field id="workingHours" label={t.page.hours} error={errors.workingHours} optional>
              <input id="workingHours" className="input" maxLength={LIMITS.workingHours} placeholder={t.dash.hoursPlaceholder} value={draft.workingHours} onChange={(e) => set("workingHours", e.target.value)} />
            </Field>
            <Field id="serviceArea" label={t.page.serviceArea} error={errors.serviceArea} optional>
              <input id="serviceArea" className="input" maxLength={LIMITS.serviceArea} placeholder={t.dash.serviceAreaPlaceholder} value={draft.serviceArea} onChange={(e) => set("serviceArea", e.target.value)} />
            </Field>
          </div>,
        )}

        {S(
          "sec-template",
          t.dash.secTemplate,
          <TemplatePicker value={draft.template} onChange={(id) => persist({ template: id })} />,
          (t.templates as Record<string, string>)[draft.template],
        )}

        {S(
          "sec-link",
          t.dash.secLink,
          <HandleEditor handle={profile.handle} onChanged={(h) => setProfile({ ...profile, handle: h })} />,
          `/${profile.handle}`,
        )}

        {S(
          "sec-verify",
          t.dash.secVerify,
          <VerificationForm uid={user.uid} initial={privateUser?.verification ?? null} verified={profile.verified} />,
          t.dash.secVerifySub,
        )}

        {S("sec-account", t.dash.secAccount, <DangerZone handle={profile.handle} />)}
      </main>

      {/* Save bar appears when there are unsaved changes */}
      {(dirty || saveState === "saved" || saveState === "error") && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur">
          <div className="mx-auto flex max-w-2xl items-center justify-between gap-3">
            <p className="text-sm" role="status">
              {saveState === "saved" && !dirty ? (
                <span className="text-brand-700">✓ {t.dash.savedLive}</span>
              ) : saveState === "error" ? (
                <span className="text-red-600">{errorText(t, errors._form || "fixErrors")}</span>
              ) : (
                <span className="text-muted">{t.dash.unsaved}</span>
              )}
            </p>
            {dirty && (
              <button type="button" className="btn-primary" onClick={save} disabled={saveState === "saving"}>
                {saveState === "saving" ? t.common.saving : t.dash.saveChanges}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function sectionForField(key: string): string | null {
  if (/^(name|professionId|intro|city|state|area|pincode)$/.test(key)) return "sec-basics";
  if (key === "about") return "sec-about";
  if (key.startsWith("services")) return "sec-services";
  if (key.startsWith("videos")) return "sec-work";
  if (key.startsWith("testimonials")) return "sec-reviews";
  if (/^(phone|whatsapp|email|website|instagram)$/.test(key)) return "sec-contact";
  if (/^(yearsExperience|workingHours|serviceArea|extra)/.test(key)) return "sec-more";
  return null;
}

function EditSection({
  id,
  title,
  subtitle,
  open,
  onToggle,
  children,
}: {
  id: string;
  title: string;
  subtitle?: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-20 overflow-hidden rounded-2xl border border-line bg-white">
      <button type="button" onClick={onToggle} aria-expanded={open} className="flex w-full items-center justify-between gap-3 p-4 text-left">
        <span className="min-w-0">
          <span className="block font-semibold">{title}</span>
          {subtitle && <span className="block truncate text-sm text-muted">{subtitle}</span>}
        </span>
        <span className={`text-muted transition ${open ? "rotate-180" : ""}`} aria-hidden>
          ▾
        </span>
      </button>
      {open && <div className="border-t border-line p-4">{children}</div>}
    </section>
  );
}

function PhoneInput({ id, dial, value, onChange }: { id: string; dial: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex gap-2">
      <span className="input w-auto shrink-0 bg-brand-50 px-3 text-muted">{dial}</span>
      <input id={id} type="tel" inputMode="numeric" className="input" maxLength={16} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

type SetFn = <K extends keyof Draft>(key: K, value: Draft[K]) => void;

function ServicesEditor({ draft, set, errors, currency }: { draft: Draft; set: SetFn; errors: Record<string, string>; currency: string }) {
  const { t } = useT();
  const update = (i: number, patch: Partial<Draft["services"][number]>) =>
    set("services", draft.services.map((s, j) => (j === i ? { ...s, ...patch } : s)));
  return (
    <div className="space-y-3">
      {draft.services.map((s, i) => (
        <div key={i} className="rounded-xl border border-line p-3">
          <div className="flex gap-2">
            <input
              id={`services.${i}.name`}
              className="input"
              placeholder={t.dash.serviceName}
              maxLength={LIMITS.serviceName}
              value={s.name}
              onChange={(e) => update(i, { name: e.target.value })}
              aria-label={t.dash.serviceName}
            />
            <button
              type="button"
              onClick={() => set("services", draft.services.filter((_, j) => j !== i))}
              className="shrink-0 rounded-xl px-3 text-xl text-muted hover:text-red-600"
              aria-label={t.dash.removeService}
            >
              ×
            </button>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <label className="text-xs text-muted">
              {t.dash.priceMin} ({currency})
              <input className="input mt-1" inputMode="numeric" value={s.priceMin} onChange={(e) => update(i, { priceMin: e.target.value.replace(/[^\d]/g, "") })} />
            </label>
            <label className="text-xs text-muted">
              {t.dash.priceMax} ({currency})
              <input className="input mt-1" inputMode="numeric" value={s.priceMax} onChange={(e) => update(i, { priceMax: e.target.value.replace(/[^\d]/g, "") })} />
            </label>
          </div>
          {(errors[`services.${i}.name`] || errors[`services.${i}.priceMax`]) && (
            <p className="mt-1 text-sm text-red-600">{errorText(t, errors[`services.${i}.name`] || errors[`services.${i}.priceMax`])}</p>
          )}
        </div>
      ))}
      <p className="text-xs text-muted">{t.dash.priceHint}</p>
      {draft.services.length < LIMITS.services && (
        <button type="button" className="btn-secondary w-full" onClick={() => set("services", [...draft.services, { name: "", priceMin: "", priceMax: "" }])}>
          + {t.dash.addService}
        </button>
      )}
    </div>
  );
}

function ReviewsEditor({ draft, set, errors }: { draft: Draft; set: SetFn; errors: Record<string, string> }) {
  const { t } = useT();
  const update = (i: number, patch: Partial<Draft["testimonials"][number]>) =>
    set("testimonials", draft.testimonials.map((r, j) => (j === i ? { ...r, ...patch } : r)));
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted">{t.dash.reviewsHint}</p>
      {draft.testimonials.map((r, i) => {
        const err = errors[`testimonials.${i}.name`] || errors[`testimonials.${i}.text`] || errors[`testimonials.${i}.detail`];
        return (
          <div key={i} className="rounded-xl border border-line p-3">
            <div className="flex gap-2">
              <input
                id={`testimonials.${i}.name`}
                className="input"
                placeholder={t.dash.reviewName}
                aria-label={t.dash.reviewName}
                maxLength={LIMITS.testimonialName}
                value={r.name}
                onChange={(e) => update(i, { name: e.target.value })}
              />
              <button
                type="button"
                onClick={() => set("testimonials", draft.testimonials.filter((_, j) => j !== i))}
                className="shrink-0 rounded-xl px-3 text-xl text-muted hover:text-red-600"
                aria-label={t.dash.removeService}
              >
                ×
              </button>
            </div>
            <textarea
              id={`testimonials.${i}.text`}
              className="input mt-2 min-h-20"
              placeholder={t.dash.reviewText}
              aria-label={t.dash.reviewText}
              maxLength={LIMITS.testimonialText}
              value={r.text}
              onChange={(e) => update(i, { text: e.target.value })}
            />
            <input
              id={`testimonials.${i}.detail`}
              className="input mt-2"
              placeholder={t.dash.reviewDetail}
              aria-label={t.dash.reviewDetail}
              maxLength={LIMITS.testimonialDetail}
              value={r.detail}
              onChange={(e) => update(i, { detail: e.target.value })}
            />
            {err && <p className="mt-1 text-sm text-red-600">{errorText(t, err)}</p>}
          </div>
        );
      })}
      {draft.testimonials.length < LIMITS.testimonials && (
        <button
          type="button"
          className="btn-secondary w-full"
          onClick={() => set("testimonials", [...draft.testimonials, { name: "", text: "", detail: "" }])}
        >
          + {t.dash.addReview}
        </button>
      )}
    </div>
  );
}

function VideosEditor({ draft, set, errors }: { draft: Draft; set: SetFn; errors: Record<string, string> }) {
  const { t } = useT();
  return (
    <div>
      <p className="label">
        {t.dash.videos} <span className="font-normal text-muted">({t.common.optional})</span>
      </p>
      <p className="mb-2 text-sm text-muted">{t.dash.videosHint}</p>
      <div className="space-y-2">
        {draft.videos.map((v, i) => (
          <div key={i}>
            <div className="flex gap-2">
              <input
                id={`videos.${i}`}
                className="input"
                type="url"
                placeholder="https://youtube.com/…"
                value={v}
                onChange={(e) => set("videos", draft.videos.map((x, j) => (j === i ? e.target.value : x)))}
              />
              <button type="button" onClick={() => set("videos", draft.videos.filter((_, j) => j !== i))} className="shrink-0 px-3 text-xl text-muted" aria-label={t.dash.removeService}>
                ×
              </button>
            </div>
            {errors[`videos.${i}`] && <p className="mt-1 text-sm text-red-600">{errorText(t, errors[`videos.${i}`])}</p>}
          </div>
        ))}
        {draft.videos.length < LIMITS.videos && (
          <button type="button" className="text-sm font-semibold text-brand-700" onClick={() => set("videos", [...draft.videos, ""])}>
            + {t.dash.addVideo}
          </button>
        )}
      </div>
    </div>
  );
}
