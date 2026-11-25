"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  GoogleAuthProvider,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  signInWithPopup,
  signInWithRedirect,
  type ConfirmationResult,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { firebase } from "@/lib/firebase/client";
import { useAuth } from "@/components/auth/AuthProvider";
import { useT } from "@/i18n/client";
import { fmt } from "@/i18n";
import { COUNTRIES, DEFAULT_COUNTRY, LAUNCH_COUNTRIES, formatPhone, toE164, type CountryCode } from "@/config/countries";
import { errorText, firebaseErrorKey } from "@/lib/errors";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Logo } from "@/components/Logo";

const RESEND_SECONDS = 30;

export default function LoginPage() {
  const { t } = useT();
  const router = useRouter();
  const { user, loading } = useAuth();

  const [country, setCountry] = useState<CountryCode>(DEFAULT_COUNTRY);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(0);
  const recaptcha = useRef<RecaptchaVerifier | null>(null);

  // Once logged in, go to the dashboard if a page exists, otherwise to Step 1.
  useEffect(() => {
    if (loading || !user) return;
    (async () => {
      try {
        const snap = await getDoc(doc(firebase().db, "profiles", user.uid));
        router.replace(snap.exists() ? "/dashboard" : "/onboarding");
      } catch {
        router.replace("/onboarding");
      }
    })();
  }, [user, loading, router]);

  useEffect(() => {
    if (countdown <= 0) return;
    const id = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [countdown]);

  function getRecaptcha() {
    if (!recaptcha.current) {
      recaptcha.current = new RecaptchaVerifier(firebase().auth, "recaptcha-container", { size: "invisible" });
    }
    return recaptcha.current;
  }

  async function sendOtp(e?: React.FormEvent) {
    e?.preventDefault();
    setError("");
    const e164 = toE164(phone, country);
    if (!e164) return setError("invalidPhone");
    setBusy(true);
    try {
      const { auth } = firebase();
      auth.languageCode = document.documentElement.lang || "en"; // SMS in the user's language
      const result = await signInWithPhoneNumber(auth, e164, getRecaptcha());
      setConfirmation(result);
      setCountdown(RESEND_SECONDS);
    } catch (err) {
      console.error(err);
      recaptcha.current?.clear();
      recaptcha.current = null;
      setError(firebaseErrorKey(err));
    } finally {
      setBusy(false);
    }
  }

  async function verifyOtp(e: React.FormEvent) {
    e.preventDefault();
    if (!confirmation) return;
    setError("");
    setBusy(true);
    try {
      await confirmation.confirm(otp.trim());
      // the useEffect above redirects
    } catch (err) {
      setError(firebaseErrorKey(err));
      setBusy(false);
    }
  }

  async function google() {
    setError("");
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    try {
      await signInWithPopup(firebase().auth, provider);
    } catch (err) {
      const code = (err as { code?: string }).code;
      if (code === "auth/popup-blocked") return signInWithRedirect(firebase().auth, provider);
      if (code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request") return;
      setError(firebaseErrorKey(err));
    }
  }

  if (user) {
    return <p className="p-10 text-center text-muted">{t.auth.redirecting}</p>;
  }

  const c = COUNTRIES[country];

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col px-4 py-5">
      <div className="flex items-center justify-between">
        <Link href="/">
          <Logo />
        </Link>
        <LanguageSwitcher />
      </div>

      <div className="mt-10">
        <h1 className="font-serif text-3xl leading-tight">{t.auth.title}</h1>
        <p className="mt-2 text-muted">{t.auth.sub}</p>
      </div>

      <div className="card mt-8">
        {!confirmation ? (
          <form onSubmit={sendOtp} noValidate>
            <label htmlFor="phone" className="label">
              {t.auth.mobileLabel}
            </label>
            <div className="flex gap-2">
              <select
                aria-label="Country code"
                value={country}
                onChange={(e) => setCountry(e.target.value as CountryCode)}
                className="input w-auto px-3"
                disabled={LAUNCH_COUNTRIES.length < 2}
              >
                {LAUNCH_COUNTRIES.map((code) => (
                  <option key={code} value={code}>
                    {COUNTRIES[code].dial}
                  </option>
                ))}
              </select>
              <input
                id="phone"
                type="tel"
                inputMode="numeric"
                autoComplete="tel-national"
                placeholder={t.auth.mobilePlaceholder}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="input"
                maxLength={16}
                autoFocus
              />
            </div>
            <button type="submit" className="btn-primary mt-4 w-full" disabled={busy || phone.length < 6}>
              {busy ? t.auth.sendingOtp : t.auth.sendOtp}
            </button>
          </form>
        ) : (
          <form onSubmit={verifyOtp} noValidate>
            <p className="mb-3 text-sm text-muted">
              {fmt(t.auth.otpSentTo, { phone: formatPhone(toE164(phone, country) || c.dial + phone) })}
            </p>
            <label htmlFor="otp" className="label">
              {t.auth.otpLabel}
            </label>
            <input
              id="otp"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="\d{6}"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              className="input text-center text-2xl tracking-[0.5em]"
              autoFocus
            />
            <button type="submit" className="btn-primary mt-4 w-full" disabled={busy || otp.length !== 6}>
              {busy ? t.auth.verifying : t.auth.verify}
            </button>
            <div className="mt-4 flex justify-between text-sm">
              <button
                type="button"
                className="font-medium text-brand-700"
                onClick={() => {
                  setConfirmation(null);
                  setOtp("");
                  setError("");
                }}
              >
                {t.auth.changeNumber}
              </button>
              {countdown > 0 ? (
                <span className="text-muted">{fmt(t.auth.resendIn, { seconds: countdown })}</span>
              ) : (
                <button type="button" className="font-medium text-brand-700" onClick={() => sendOtp()}>
                  {t.auth.resend}
                </button>
              )}
            </div>
          </form>
        )}

        {error && (
          <p role="alert" className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {errorText(t, error)}
          </p>
        )}

        {!confirmation && (
          <>
            <div className="my-5 flex items-center gap-3 text-xs uppercase text-muted">
              <span className="h-px flex-1 bg-line" />
              {t.auth.or}
              <span className="h-px flex-1 bg-line" />
            </div>
            <button type="button" onClick={google} className="btn-secondary w-full">
              <GoogleIcon />
              {t.auth.google}
            </button>
          </>
        )}
      </div>

      <p className="mt-6 text-center text-xs text-muted">
        <AgreeText />
      </p>
      <div id="recaptcha-container" />
    </main>
  );
}

function AgreeText() {
  const { t } = useT();
  const [before, rest] = t.auth.agree.split("{terms}");
  const [middle, after] = (rest ?? "").split("{privacy}");
  return (
    <>
      {before}
      <Link href="/terms" className="underline">
        {t.legal.termsTitle}
      </Link>
      {middle}
      <Link href="/privacy" className="underline">
        {t.legal.privacyTitle}
      </Link>
      {after}
    </>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}
