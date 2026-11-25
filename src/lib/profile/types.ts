import type { CountryCode } from "@/config/countries";
import type { TemplateId } from "@/config/templates";

/** An uploaded image: public URL + its path in Firebase Storage (needed to delete it). */
export type StoredImage = { url: string; path: string };

export type Service = {
  name: string;
  priceMin: number | null;
  priceMax: number | null;
};

/** Contact channels. Add new messaging apps here without changing the database. */
export type Contact = {
  phone: string; // E.164, e.g. +919876543210 — used for the Call button
  whatsapp: string; // E.164 or "" (falls back to phone)
  email: string;
  website: string;
  instagram: string; // handle without @
};

/** Public profile — stored at profiles/{uid}. Everything here can be shown on the page. */
export type Profile = {
  uid: string;
  handle: string;
  published: boolean;
  template: TemplateId;
  verified: boolean; // badge; only Maya admins can change this

  // Step 1 — Basics
  name: string;
  professionId: string;
  country: CountryCode;
  state: string;
  city: string;
  area: string;
  pincode: string;
  intro: string; // the one-line intro

  // Step 2 — Page details
  about: string;
  photo: StoredImage | null;
  cover: StoredImage | null;
  yearsExperience: number | null;
  services: Service[];
  currency: string; // ISO 4217, e.g. INR — never hardcoded in the UI
  portfolio: StoredImage[];
  videos: string[]; // YouTube / Instagram links
  languages: string[]; // ISO 639-1 codes
  contact: Contact;
  workingHours: string;
  serviceArea: string;
  extra: Record<string, string>; // profession-specific fields

  createdAt: number; // ms since epoch
  updatedAt: number;
  publishedAt: number | null;
};

/** Private data — stored at users/{uid}. Only the owner (and Maya admins) can read it. */
export type PrivateUser = {
  uid: string;
  signInPhone: string | null;
  signInEmail: string | null;
  lang: string;
  consent: { termsVersion: string; acceptedAt: number };
  verification: Verification | null;
  signupRef: string | null; // page link that brought them to Maya, if any
  createdAt: number;
};

export type Verification = {
  pan: string;
  businessIdType: "" | "gst" | "udyam" | "shop_licence";
  businessId: string;
  licenceName: string; // e.g. "ICAI membership"
  licenceNumber: string;
  status: "submitted" | "verified" | "rejected";
  submittedAt: number;
};

/** Fields the owner may change from the dashboard (Steps 1 & 2 + template). */
export const EDITABLE_PROFILE_FIELDS = [
  "template",
  "name",
  "professionId",
  "state",
  "city",
  "area",
  "pincode",
  "intro",
  "about",
  "photo",
  "cover",
  "yearsExperience",
  "services",
  "portfolio",
  "videos",
  "languages",
  "contact",
  "workingHours",
  "serviceArea",
  "extra",
  "updatedAt",
] as const;

export type EditableProfile = Pick<Profile, Exclude<(typeof EDITABLE_PROFILE_FIELDS)[number], "updatedAt">>;

export const TERMS_VERSION = "2026-11-25";
