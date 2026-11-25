import { COUNTRIES, formatPrice } from "@/config/countries";
import { professionName } from "@/config/professions";
import { fmt, type Dict, type Lang } from "@/i18n";
import type { Profile, Service } from "@/lib/profile/types";

export type PageCtx = { profile: Profile; lang: Lang; t: Dict; url: string };

export function digits(e164: string) {
  return e164.replace(/\D/g, "");
}

export function whatsappHref(p: Profile, t: Dict): string {
  const number = digits(p.contact.whatsapp || p.contact.phone);
  const text = fmt(t.page.whatsappMessage, { name: p.name });
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}

export function callHref(p: Profile): string {
  return `tel:${p.contact.phone}`;
}

export function localeFor(p: Profile): string {
  return COUNTRIES[p.country]?.locale ?? "en-IN";
}

export function priceText(s: Service, p: Profile, t: Dict): string {
  const f = (n: number) => formatPrice(n, p.currency, localeFor(p));
  if (s.priceMin != null && s.priceMax != null && s.priceMax !== s.priceMin) return `${f(s.priceMin)} – ${f(s.priceMax)}`;
  if (s.priceMin != null) return s.priceMax === s.priceMin ? f(s.priceMin) : fmt(t.page.priceFrom, { price: f(s.priceMin) });
  if (s.priceMax != null) return fmt(t.page.priceUpTo, { price: f(s.priceMax) });
  return t.page.priceOnRequest;
}

/** Google Maps search for the professional's area — no API key needed. */
export function mapsHref(p: Profile): string {
  const q = [p.area, p.city, p.state, p.pincode, COUNTRIES[p.country]?.name].filter(Boolean).join(", ");
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
}

export function placeLine(p: Profile): string {
  return [p.area, p.city].filter(Boolean).join(", ");
}

export function roleLine(p: Profile, lang: Lang): string {
  return [professionName(p.professionId, lang), p.city].filter(Boolean).join(" · ");
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => [...w][0])
    .join("")
    .toUpperCase();
}

/** YouTube video id from any YouTube URL, or null. */
export function youtubeId(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{11})/);
  return m ? m[1] : null;
}

export function websiteLabel(url: string): string {
  return url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");
}
