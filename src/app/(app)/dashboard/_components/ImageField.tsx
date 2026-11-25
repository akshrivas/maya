"use client";

import { useRef, useState } from "react";
import { useT } from "@/i18n/client";
import { errorText } from "@/lib/errors";
import { ImageError, removeImage, uploadImage } from "@/lib/images";
import type { StoredImage } from "@/lib/profile/types";

/** Upload / replace / remove a single image (profile photo or cover). Saves immediately. */
export function ImageField({
  uid,
  kind,
  value,
  onSaved,
  shape = "square",
  label,
}: {
  uid: string;
  kind: "photo" | "cover";
  value: StoredImage | null;
  onSaved: (img: StoredImage | null) => Promise<void>;
  shape?: "square" | "wide";
  label: string;
}) {
  const { t } = useT();
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function pick(file: File | undefined) {
    if (!file) return;
    setError("");
    setBusy(true);
    try {
      const img = await uploadImage(uid, file, kind);
      const old = value;
      await onSaved(img);
      await removeImage(old);
    } catch (e) {
      setError(e instanceof ImageError ? e.key : "generic");
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  }

  async function remove() {
    setBusy(true);
    try {
      const old = value;
      await onSaved(null);
      await removeImage(old);
    } finally {
      setBusy(false);
    }
  }

  const box = shape === "square" ? "h-24 w-24 rounded-2xl" : "h-24 w-full rounded-2xl sm:w-64";
  return (
    <div>
      <p className="label">{label}</p>
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => input.current?.click()}
          className={`relative shrink-0 overflow-hidden border-2 border-dashed border-line bg-brand-50 ${box}`}
          aria-label={label}
          disabled={busy}
        >
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value.url} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="text-3xl text-brand-600">+</span>
          )}
          {busy && <span className="absolute inset-0 grid place-items-center bg-white/70 text-sm">…</span>}
        </button>
        <div className="flex flex-col items-start gap-1 text-sm">
          <button type="button" className="font-semibold text-brand-700" onClick={() => input.current?.click()} disabled={busy}>
            {value ? t.dash.changePhoto : t.dash.uploadPhoto}
          </button>
          {value && (
            <button type="button" className="text-red-600" onClick={remove} disabled={busy}>
              {t.dash.removePhoto}
            </button>
          )}
        </div>
      </div>
      <input
        ref={input}
        type="file"
        accept="image/*"
        className="hidden"
        data-testid={`upload-${kind}`}
        onChange={(e) => pick(e.target.files?.[0])}
      />
      {error && <p className="mt-1 text-sm text-red-600">{errorText(t, error)}</p>}
    </div>
  );
}

/** Upload several work photos at once (max 12 in total). Saves immediately. */
export function PortfolioField({
  uid,
  value,
  max,
  onSaved,
}: {
  uid: string;
  value: StoredImage[];
  max: number;
  onSaved: (imgs: StoredImage[]) => Promise<void>;
}) {
  const { t } = useT();
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function pick(files: FileList | null) {
    if (!files?.length) return;
    setError("");
    setBusy(true);
    const room = max - value.length;
    const uploaded: StoredImage[] = [];
    try {
      for (const f of Array.from(files).slice(0, room)) uploaded.push(await uploadImage(uid, f, "work"));
    } catch (e) {
      setError(e instanceof ImageError ? e.key : "generic");
    }
    if (uploaded.length) await onSaved([...value, ...uploaded]);
    setBusy(false);
    if (input.current) input.current.value = "";
  }

  async function remove(img: StoredImage) {
    await onSaved(value.filter((i) => i.path !== img.path));
    await removeImage(img);
  }

  return (
    <div>
      <div className="grid grid-cols-3 gap-2">
        {value.map((img) => (
          <div key={img.path} className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img.url} alt="" className="aspect-square w-full rounded-xl object-cover" />
            <button
              type="button"
              onClick={() => remove(img)}
              className="absolute right-1 top-1 grid h-7 w-7 place-items-center rounded-full bg-black/60 text-white"
              aria-label={t.dash.removePhoto}
            >
              ×
            </button>
          </div>
        ))}
        {value.length < max && (
          <button
            type="button"
            onClick={() => input.current?.click()}
            disabled={busy}
            className="grid aspect-square place-items-center rounded-xl border-2 border-dashed border-line bg-brand-50 text-sm font-semibold text-brand-700"
          >
            {busy ? "…" : `+ ${t.dash.addPhotos}`}
          </button>
        )}
      </div>
      <p className="mt-1 text-sm text-muted">
        {value.length}/{max}
      </p>
      <input
        ref={input}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        data-testid="upload-work"
        onChange={(e) => pick(e.target.files)}
      />
      {error && <p className="mt-1 text-sm text-red-600">{errorText(t, error)}</p>}
    </div>
  );
}
