// Countries Maya supports. India is live; add a row here to open a new country.
// Everything country-specific (dial code, currency, number format) comes from this table.

export type CountryCode = "IN" | "AE" | "NP" | "US" | "GB";

export type Country = {
  code: CountryCode;
  name: string; // English name (universal)
  dial: string; // phone country code, e.g. "+91"
  currency: string; // ISO 4217, e.g. "INR"
  locale: string; // used for number/currency formatting
  nationalNumberLength: [number, number]; // min / max digits after the dial code
  hasPincode: boolean;
};

export const COUNTRIES: Record<CountryCode, Country> = {
  IN: { code: "IN", name: "India", dial: "+91", currency: "INR", locale: "en-IN", nationalNumberLength: [10, 10], hasPincode: true },
  AE: { code: "AE", name: "United Arab Emirates", dial: "+971", currency: "AED", locale: "en-AE", nationalNumberLength: [8, 9], hasPincode: false },
  NP: { code: "NP", name: "Nepal", dial: "+977", currency: "NPR", locale: "en-NP", nationalNumberLength: [9, 10], hasPincode: false },
  US: { code: "US", name: "United States", dial: "+1", currency: "USD", locale: "en-US", nationalNumberLength: [10, 10], hasPincode: false },
  GB: { code: "GB", name: "United Kingdom", dial: "+44", currency: "GBP", locale: "en-GB", nationalNumberLength: [10, 10], hasPincode: false },
};

/** Countries where professionals can sign up today. */
export const LAUNCH_COUNTRIES: CountryCode[] = ["IN"];
export const DEFAULT_COUNTRY: CountryCode = "IN";

export function isCountryCode(v: unknown): v is CountryCode {
  return typeof v === "string" && v in COUNTRIES;
}

/**
 * Turns user input like "98765 43210" or "+91 98765-43210" into "+919876543210".
 * Returns null if it isn't a valid number for that country.
 */
export function toE164(input: string, country: CountryCode): string | null {
  const c = COUNTRIES[country];
  let digits = input.replace(/[^\d+]/g, "");
  const dialDigits = c.dial.slice(1);
  if (digits.startsWith("+")) {
    if (!digits.startsWith(c.dial)) return null;
    digits = digits.slice(c.dial.length);
  } else if (digits.startsWith("00" + dialDigits)) {
    digits = digits.slice(2 + dialDigits.length);
  } else if (country === "IN" && digits.length === 12 && digits.startsWith("91")) {
    digits = digits.slice(2);
  }
  digits = digits.replace(/^0+/, ""); // trunk prefix, e.g. 098765...
  if (!/^\d+$/.test(digits)) return null;
  const [min, max] = c.nationalNumberLength;
  if (digits.length < min || digits.length > max) return null;
  if (country === "IN" && !/^[6-9]/.test(digits)) return null; // Indian mobiles start 6–9
  return c.dial + digits;
}

/** "+919876543210" -> "+91 98765 43210" for display. */
export function formatPhone(e164: string): string {
  const country = Object.values(COUNTRIES)
    .sort((a, b) => b.dial.length - a.dial.length)
    .find((c) => e164.startsWith(c.dial));
  if (!country) return e164;
  const rest = e164.slice(country.dial.length);
  if (country.code === "IN" && rest.length === 10) return `${country.dial} ${rest.slice(0, 5)} ${rest.slice(5)}`;
  return `${country.dial} ${rest}`;
}

/** Price formatting that follows the profile's currency — never hardcoded "₹". */
export function formatPrice(amount: number, currency: string, locale: string): string {
  try {
    return new Intl.NumberFormat(locale, { style: "currency", currency, maximumFractionDigits: 0 }).format(amount);
  } catch {
    return `${currency} ${amount}`;
  }
}
