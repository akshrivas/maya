// Page links: maya.in/<handle>. Handles are lowercase letters, numbers and hyphens.

/** Paths used by the app itself, so nobody can take them as a handle. */
export const RESERVED_HANDLES = new Set([
  "about", "account", "admin", "api", "app", "assets", "auth", "blog", "contact", "dashboard",
  "delete", "edit", "explore", "faq", "help", "home", "login", "logout", "maya", "new",
  "onboarding", "privacy", "pricing", "profile", "register", "robots.txt", "search", "settings",
  "signin", "signup", "sitemap.xml", "static", "support", "terms", "www", "_next", "favicon.ico",
]);

export const HANDLE_MIN = 3;
export const HANDLE_MAX = 40;

/** "Priya Sharma", "Indore" -> "priya-sharma" ; keeps only a–z, 0–9 and hyphens. */
export function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "") // strip accents (é -> e)
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

export function isValidHandle(handle: string): boolean {
  return (
    handle.length >= HANDLE_MIN &&
    handle.length <= HANDLE_MAX &&
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(handle) &&
    !RESERVED_HANDLES.has(handle)
  );
}

/**
 * Suggested handle in the "name-city" format (FSD open question — decided: name-city,
 * editable later). Falls back to profession-city when the name has no Latin letters
 * (e.g. typed in Hindi).
 */
export function baseHandle(name: string, city: string, professionId: string): string {
  const cut = (s: string, n: number) => s.slice(0, n).replace(/-+$/, "");
  const nameSlug = cut(slugify(name), 24);
  const citySlug = cut(slugify(city), 14);
  const first = nameSlug.length >= 2 ? nameSlug : cut(slugify(professionId.replace(/_/g, " ")), 24);
  let h = [first, citySlug].filter(Boolean).join("-");
  if (h.length < HANDLE_MIN) h = `${h || "pro"}-maya`;
  if (RESERVED_HANDLES.has(h)) h = `${h}-pro`;
  return cut(h, HANDLE_MAX);
}

/** Candidates to try in order: base, base-2, base-3, … then a random suffix. */
export function handleCandidates(base: string, count = 8): string[] {
  const out = [base];
  for (let i = 2; i <= count; i++) out.push(`${base.slice(0, HANDLE_MAX - 3)}-${i}`);
  out.push(`${base.slice(0, HANDLE_MAX - 5)}-${Math.random().toString(36).slice(2, 6)}`);
  return out;
}
