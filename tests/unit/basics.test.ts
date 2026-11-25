import { describe, expect, it } from "vitest";
import { toE164, formatPhone, formatPrice } from "@/config/countries";
import { baseHandle, handleCandidates, isValidHandle, slugify } from "@/lib/profile/handle";
import { searchProfessions } from "@/config/professions";
import { en } from "@/i18n/en";
import { hi } from "@/i18n/hi";

describe("phone numbers are stored with country code", () => {
  it("normalises common Indian formats to +91XXXXXXXXXX", () => {
    expect(toE164("98765 43210", "IN")).toBe("+919876543210");
    expect(toE164("+91 98765-43210", "IN")).toBe("+919876543210");
    expect(toE164("09876543210", "IN")).toBe("+919876543210");
    expect(toE164("919876543210", "IN")).toBe("+919876543210");
  });
  it("rejects invalid numbers", () => {
    expect(toE164("12345", "IN")).toBeNull();
    expect(toE164("1234567890", "IN")).toBeNull(); // Indian mobiles start with 6-9
    expect(toE164("+44 7911 123456", "IN")).toBeNull();
  });
  it("formats for display", () => {
    expect(formatPhone("+919876543210")).toBe("+91 98765 43210");
  });
});

describe("prices follow the currency, not a hardcoded symbol", () => {
  it("formats INR and other currencies", () => {
    expect(formatPrice(1500, "INR", "en-IN")).toContain("₹");
    expect(formatPrice(1500, "AED", "en-AE")).toContain("AED");
  });
});

describe("page links (handles)", () => {
  it("builds name-city links", () => {
    expect(baseHandle("Priya Sharma", "Indore", "makeup_artist")).toBe("priya-sharma-indore");
    expect(baseHandle("Dr. R. K. Gupta & Sons", "New Delhi", "doctor")).toBe("dr-r-k-gupta-and-sons-new-delhi");
  });
  it("falls back to the profession when the name is not in Latin letters", () => {
    expect(baseHandle("प्रिया शर्मा", "Indore", "makeup_artist")).toBe("makeup-artist-indore");
  });
  it("never produces reserved or invalid links", () => {
    expect(isValidHandle("dashboard")).toBe(false);
    expect(isValidHandle("ab")).toBe(false);
    expect(isValidHandle("Priya")).toBe(false);
    expect(isValidHandle("priya--x")).toBe(false);
    expect(isValidHandle("priya-sharma-indore")).toBe(true);
    for (const c of handleCandidates(baseHandle("A very long business name that goes on", "Thiruvananthapuram", "x")))
      expect(isValidHandle(c)).toBe(true);
  });
  it("slugify strips accents and symbols", () => {
    expect(slugify("  Café   Délice!! ")).toBe("cafe-delice");
  });
});

describe("profession search", () => {
  it("finds by English, Hindi and aliases", () => {
    expect(searchProfessions("vakil", "en").map((p) => p.id)).toContain("lawyer");
    expect(searchProfessions("ca", "en").map((p) => p.id)).toContain("chartered_accountant");
    expect(searchProfessions("डॉक्टर", "hi").map((p) => p.id)).toContain("doctor");
  });
});

describe("translations", () => {
  it("Hindi has every key that English has", () => {
    const keys = (o: object, prefix = ""): string[] =>
      Object.entries(o).flatMap(([k, v]) => (typeof v === "object" ? keys(v, `${prefix}${k}.`) : [`${prefix}${k}`]));
    expect(keys(hi).sort()).toEqual(keys(en).sort());
  });
});

describe("profession search ranking", () => {
  it("puts names starting with the query first", () => {
    expect(searchProfessions("tu", "en")[0].id).toBe("tutor");
    expect(searchProfessions("elec", "en")[0].id).toBe("electrician");
  });
});
