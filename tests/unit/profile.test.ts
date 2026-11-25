// Profile save logic (no Firebase needed): validation, completion score, dashboard draft conversion.
import { describe, expect, it } from "vitest";
import { profileCompletion } from "@/lib/profile/completion";
import { step1Schema } from "@/lib/profile/schema";
import { fromDraft, toDraft } from "@/app/(app)/dashboard/_components/draft";
import { sampleProfile } from "../rules/helpers";

describe("Step 1 sign-up form validation", () => {
  const ok = {
    name: "Asha Verma",
    professionId: "tutor",
    country: "IN",
    state: "Madhya Pradesh",
    city: "Indore",
    area: "",
    pincode: "452010",
    intro: "Maths tutor for Class 6 to 10",
    phone: "98765 43210",
    acceptTerms: true,
  };
  it("accepts a complete form and stores the phone with country code", () => {
    const r = step1Schema.safeParse(ok);
    expect(r.success).toBe(true);
    expect(r.success && r.data.phone).toBe("+919876543210");
  });
  it("rejects missing terms, bad phone, bad pincode, unknown profession", () => {
    expect(step1Schema.safeParse({ ...ok, acceptTerms: false }).success).toBe(false);
    expect(step1Schema.safeParse({ ...ok, phone: "123" }).success).toBe(false);
    expect(step1Schema.safeParse({ ...ok, pincode: "12" }).success).toBe(false);
    expect(step1Schema.safeParse({ ...ok, professionId: "astronaut" }).success).toBe(false);
  });
});

describe("profile completion bar", () => {
  it("a fresh page (Step 1 only) is 40%", () => {
    expect(profileCompletion(sampleProfile("u")).percent).toBe(40);
  });
  it("a full page is 100%", () => {
    const img = { url: "https://x/y.jpg", path: "users/u/y.jpg" };
    const full = sampleProfile("u", {
      photo: img,
      cover: img,
      about: "A long enough about text that describes the work in some detail.",
      services: [{ name: "Tuition", priceMin: 1000, priceMax: null }],
      portfolio: [img],
      yearsExperience: 5,
      languages: ["hi"],
      workingHours: "Mon–Sat",
      serviceArea: "Indore",
    });
    expect(profileCompletion(full).percent).toBe(100);
  });
});

describe("dashboard save (draft -> saved profile)", () => {
  it("round-trips without changes", () => {
    const p = sampleProfile("u");
    const r = fromDraft(toDraft(p), p);
    expect(r.ok).toBe(true);
    expect(r.ok && r.data.contact.phone).toBe("+919876543210");
  });
  it("converts typed prices and drops empty service rows", () => {
    const p = sampleProfile("u");
    const d = toDraft(p);
    d.services = [
      { name: "Home tuition", priceMin: "2,000", priceMax: "4000" },
      { name: "", priceMin: "", priceMax: "" },
    ];
    d.instagram = "https://instagram.com/asha.tutor/";
    const r = fromDraft(d, p);
    expect(r.ok && r.data.services).toEqual([{ name: "Home tuition", priceMin: 2000, priceMax: 4000 }]);
    expect(r.ok && r.data.contact.instagram).toBe("asha.tutor");
  });
  it("reports friendly errors", () => {
    const p = sampleProfile("u");
    const d = { ...toDraft(p), email: "nope", phone: "12", services: [{ name: "X", priceMin: "500", priceMax: "100" }] };
    const r = fromDraft(d, p);
    expect(r.ok).toBe(false);
    expect(!r.ok && r.errors).toMatchObject({ email: "invalidEmail", phone: "invalidPhone", "services.0.priceMax": "priceRange" });
  });
});
