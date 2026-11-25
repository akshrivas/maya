"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { useT } from "@/i18n/client";

/**
 * "Share" button + sheet: native share (on phones), copy link, share on WhatsApp,
 * and a QR code that can be downloaded for visiting cards.
 */
export function ShareButton({
  url,
  title,
  text,
  className = "",
  label,
  fileName = "maya-qr",
}: {
  url: string;
  title: string;
  text: string;
  className?: string;
  label?: string;
  fileName?: string;
}) {
  const { t } = useT();
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className} aria-haspopup="dialog">
        <ShareIcon />
        {label ?? t.page.share}
      </button>
      {open && <ShareSheet url={url} title={title} text={text} fileName={fileName} onClose={() => setOpen(false)} />}
    </>
  );
}

export function ShareSheet({
  url,
  title,
  text,
  fileName,
  onClose,
}: {
  url: string;
  title: string;
  text: string;
  fileName: string;
  onClose: () => void;
}) {
  const { t } = useT();
  const [qr, setQr] = useState("");
  const [copied, setCopied] = useState(false);
  const canNativeShare = typeof navigator !== "undefined" && !!navigator.share;

  useEffect(() => {
    QRCode.toDataURL(url, { width: 640, margin: 2, errorCorrectionLevel: "M" }).then(setQr);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [url, onClose]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const el = document.createElement("textarea");
      el.value = url;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      el.remove();
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const shortUrl = url.replace(/^https?:\/\//, "");

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t.page.shareTitle}
        className="w-full max-w-sm rounded-t-3xl bg-white p-5 text-[#16211e] shadow-2xl sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">{t.page.shareTitle}</h2>
          <button type="button" onClick={onClose} className="rounded-full p-2 text-xl leading-none hover:bg-black/5" aria-label={t.page.close}>
            ×
          </button>
        </div>

        <div className="mt-3 flex items-center gap-2 rounded-xl border border-black/10 bg-black/[0.03] p-2 pl-3">
          <span className="min-w-0 flex-1 truncate text-sm font-medium">{shortUrl}</span>
          <button type="button" onClick={copy} className="shrink-0 rounded-lg bg-[#16211e] px-3 py-2 text-sm font-semibold text-white">
            {copied ? t.page.copied : t.page.copyLink}
          </button>
        </div>

        <div className="mt-3 grid gap-2">
          {canNativeShare && (
            <button
              type="button"
              onClick={() => navigator.share({ title, text, url }).catch(() => {})}
              className="rounded-xl border border-black/10 px-4 py-3 font-semibold"
            >
              {t.page.share}…
            </button>
          )}
          <a
            href={`https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl bg-[#1fa855] px-4 py-3 text-center font-semibold text-white"
          >
            {t.page.shareWhatsApp}
          </a>
        </div>

        <div className="mt-5 flex flex-col items-center text-center">
          {qr ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={qr} alt={`QR code for ${shortUrl}`} width={200} height={200} className="h-48 w-48" />
          ) : (
            <div className="h-48 w-48 animate-pulse rounded-lg bg-black/5" />
          )}
          <p className="mt-1 text-xs text-black/60">{t.page.qrHint}</p>
          {qr && (
            <a href={qr} download={`${fileName}.png`} className="mt-3 text-sm font-semibold underline">
              {t.page.downloadQr}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

function ShareIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
      <polyline points="16 6 12 2 8 6" />
      <line x1="12" y1="2" x2="12" y2="15" />
    </svg>
  );
}
