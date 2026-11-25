// The dashboard edits a "draft": the profile in a form-friendly shape (numbers and phone
// numbers as text the user types). On save it's converted back and validated.
import { COUNTRIES, toE164 } from "@/config/countries";
import { profileEditSchema, fieldErrors } from "@/lib/profile/schema";
import type { Profile, StoredImage, Testimonial } from "@/lib/profile/types";
import type { TemplateId } from "@/config/templates";

export type DraftService = { name: string; priceMin: string; priceMax: string };

export type Draft = {
  template: TemplateId;
  name: string;
  professionId: string;
  state: string;
  city: string;
  area: string;
  pincode: string;
  intro: string;
  about: string;
  photo: StoredImage | null;
  cover: StoredImage | null;
  yearsExperience: string;
  services: DraftService[];
  portfolio: StoredImage[];
  videos: string[];
  languages: string[];
  phone: string;
  whatsapp: string;
  email: string;
  website: string;
  instagram: string;
  workingHours: string;
  serviceArea: string;
  extra: Record<string, string>;
  testimonials: Testimonial[];
};

function national(e164: string, dial: string) {
  return e164.startsWith(dial) ? e164.slice(dial.length) : e164;
}

export function toDraft(p: Profile): Draft {
  const dial = COUNTRIES[p.country].dial;
  return {
    template: p.template,
    name: p.name,
    professionId: p.professionId,
    state: p.state,
    city: p.city,
    area: p.area,
    pincode: p.pincode,
    intro: p.intro,
    about: p.about,
    photo: p.photo,
    cover: p.cover,
    yearsExperience: p.yearsExperience == null ? "" : String(p.yearsExperience),
    services: p.services.map((s) => ({
      name: s.name,
      priceMin: s.priceMin == null ? "" : String(s.priceMin),
      priceMax: s.priceMax == null ? "" : String(s.priceMax),
    })),
    portfolio: p.portfolio,
    videos: p.videos,
    languages: p.languages,
    phone: national(p.contact.phone, dial),
    whatsapp: national(p.contact.whatsapp, dial),
    email: p.contact.email,
    website: p.contact.website,
    instagram: p.contact.instagram,
    workingHours: p.workingHours,
    serviceArea: p.serviceArea,
    extra: p.extra,
    testimonials: p.testimonials ?? [],
  };
}

const num = (v: string) => {
  const clean = v.replace(/[,\s]/g, "");
  if (clean === "") return null;
  const n = Number(clean);
  return Number.isFinite(n) ? Math.round(n) : NaN;
};

/** Validate a draft. Returns the data to save, or errors keyed by form field. */
export function fromDraft(d: Draft, p: Profile) {
  const errors: Record<string, string> = {};
  const phone = toE164(d.phone, p.country);
  if (!phone) errors.phone = d.phone.trim() ? "invalidPhone" : "required";
  const whatsapp = d.whatsapp.trim() ? toE164(d.whatsapp, p.country) : "";
  if (whatsapp === null) errors.whatsapp = "invalidPhone";

  const candidate = {
    template: d.template,
    name: d.name,
    professionId: d.professionId,
    state: d.state,
    city: d.city,
    area: d.area,
    pincode: d.pincode,
    intro: d.intro,
    about: d.about,
    photo: d.photo,
    cover: d.cover,
    yearsExperience: num(d.yearsExperience),
    services: d.services
      .filter((s) => s.name.trim() || s.priceMin || s.priceMax)
      .map((s) => ({ name: s.name, priceMin: num(s.priceMin), priceMax: num(s.priceMax) })),
    portfolio: d.portfolio,
    videos: d.videos.map((v) => v.trim()).filter(Boolean),
    languages: d.languages,
    contact: { phone: phone ?? "", whatsapp: whatsapp ?? "", email: d.email, website: d.website, instagram: d.instagram },
    workingHours: d.workingHours,
    serviceArea: d.serviceArea,
    extra: Object.fromEntries(Object.entries(d.extra).filter(([, v]) => v.trim())),
    // Drop rows left completely empty; half-filled rows are reported as errors.
    testimonials: d.testimonials.filter((r) => r.name.trim() || r.text.trim() || r.detail.trim()),
  };

  const parsed = profileEditSchema.safeParse(candidate);
  if (!parsed.success) {
    for (const [k, v] of Object.entries(fieldErrors(parsed.error))) {
      const key = k.replace(/^contact\./, "");
      // Messages are our error keys; anything else (e.g. a non-number price) gets a friendly default.
      const known = /^[a-zA-Z]+$/.test(v);
      errors[key] ||= known ? v : /yearsExperience|price/.test(key) ? "invalidNumber" : "generic";
    }
  }
  if (Object.keys(errors).length || !parsed.success) return { ok: false as const, errors };
  return { ok: true as const, data: parsed.data };
}
