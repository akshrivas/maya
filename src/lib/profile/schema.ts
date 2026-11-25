// Validation rules, shared by the browser (instant feedback) and the server (final check).
// Error messages are keys into the `errors` section of the dictionaries, so they can be translated.
import { z } from "zod";
import { COUNTRIES, isCountryCode, toE164, type CountryCode } from "@/config/countries";
import { getProfession } from "@/config/professions";
import { TEMPLATE_IDS } from "@/config/templates";

export const LIMITS = {
  name: 80,
  intro: 160,
  about: 2000,
  place: 80,
  services: 20,
  serviceName: 80,
  portfolio: 12,
  videos: 6,
  languages: 10,
  workingHours: 120,
  serviceArea: 160,
  extraValue: 160,
  testimonials: 6,
  testimonialName: 60,
  testimonialText: 300,
  testimonialDetail: 60,
  url: 300,
};

const text = (max: number) => z.string().trim().max(max, "tooLong");
const requiredText = (max: number) => text(max).min(1, "required");

const image = z
  .object({ url: z.string().url().max(1000), path: z.string().max(300) })
  .nullable();

export const step1Schema = z
  .object({
    name: requiredText(LIMITS.name).min(2, "tooShort"),
    professionId: z.string().refine((id) => !!getProfession(id), "required"),
    country: z.string().refine(isCountryCode, "required"),
    state: requiredText(LIMITS.place),
    city: requiredText(LIMITS.place),
    area: text(LIMITS.place).default(""),
    pincode: z.string().trim().max(10).default(""),
    intro: requiredText(LIMITS.intro).min(10, "tooShort"),
    phone: z.string().trim().min(1, "required"),
    acceptTerms: z.literal(true, { error: "acceptTerms" }),
  })
  .superRefine((v, ctx) => {
    if (!isCountryCode(v.country)) return;
    if (!toE164(v.phone, v.country)) ctx.addIssue({ code: "custom", path: ["phone"], message: "invalidPhone" });
    if (COUNTRIES[v.country].hasPincode && v.pincode && !/^\d{6}$/.test(v.pincode))
      ctx.addIssue({ code: "custom", path: ["pincode"], message: "invalidPincode" });
  })
  .transform((v) => ({ ...v, country: v.country as CountryCode, phone: toE164(v.phone, v.country as CountryCode)! }));

export type Step1Input = z.input<typeof step1Schema>;
export type Step1Data = z.output<typeof step1Schema>;

const optionalUrl = z
  .string()
  .trim()
  .max(LIMITS.url, "tooLong")
  .refine((v) => v === "" || /^https?:\/\/[^\s.]+\.[^\s]+$/i.test(v), "invalidUrl");

const e164OrEmpty = z.string().refine((v) => v === "" || /^\+\d{7,15}$/.test(v), "invalidPhone");

const price = z.number().int().min(0).max(1_000_000_000).nullable();

/** Everything the owner can edit from the dashboard. */
export const profileEditSchema = z.object({
  template: z.enum(TEMPLATE_IDS),
  name: requiredText(LIMITS.name).min(2, "tooShort"),
  professionId: z.string().refine((id) => !!getProfession(id), "required"),
  state: requiredText(LIMITS.place),
  city: requiredText(LIMITS.place),
  area: text(LIMITS.place),
  pincode: z.string().trim().max(10),
  intro: requiredText(LIMITS.intro),
  about: text(LIMITS.about),
  photo: image,
  cover: image,
  yearsExperience: z.number().int().min(0).max(80).nullable(),
  services: z
    .array(
      z
        .object({ name: requiredText(LIMITS.serviceName), priceMin: price, priceMax: price })
        .refine((s) => s.priceMin == null || s.priceMax == null || s.priceMax >= s.priceMin, {
          message: "priceRange",
          path: ["priceMax"],
        }),
    )
    .max(LIMITS.services),
  portfolio: z.array(image.unwrap()).max(LIMITS.portfolio),
  videos: z.array(optionalUrl.refine((v) => v !== "", "invalidUrl")).max(LIMITS.videos),
  languages: z.array(z.string().regex(/^[a-z]{2,3}$/)).max(LIMITS.languages),
  contact: z.object({
    phone: e164OrEmpty.refine((v) => v !== "", "required"),
    whatsapp: e164OrEmpty,
    email: z
      .string()
      .trim()
      .max(LIMITS.url)
      .refine((v) => v === "" || z.email().safeParse(v).success, "invalidEmail"),
    website: optionalUrl,
    instagram: z
      .string()
      .trim()
      .transform((v) => v.replace(/^@/, "").replace(/^https?:\/\/(www\.)?instagram\.com\//i, "").replace(/\/$/, ""))
      .refine((v) => v === "" || /^[A-Za-z0-9._]{1,30}$/.test(v), "invalidInstagram"),
  }),
  workingHours: text(LIMITS.workingHours),
  serviceArea: text(LIMITS.serviceArea),
  extra: z.record(z.string().regex(/^[a-zA-Z]{1,40}$/), text(LIMITS.extraValue)),
  testimonials: z
    .array(
      z.object({
        name: requiredText(LIMITS.testimonialName),
        text: requiredText(LIMITS.testimonialText),
        detail: text(LIMITS.testimonialDetail),
      }),
    )
    .max(LIMITS.testimonials),
});

export type ProfileEdit = z.output<typeof profileEditSchema>;

export const verificationSchema = z.object({
  pan: z
    .string()
    .trim()
    .toUpperCase()
    .refine((v) => v === "" || /^[A-Z]{5}\d{4}[A-Z]$/.test(v), "invalidPan"),
  businessIdType: z.enum(["", "gst", "udyam", "shop_licence"]),
  businessId: text(40),
  licenceName: text(80),
  licenceNumber: text(40),
});

/** Turn zod issues into { fieldPath: errorKey } for showing next to inputs. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
