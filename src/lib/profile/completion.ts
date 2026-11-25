import type { Profile } from "./types";

// What counts towards "Profile X% complete". Step 1 alone gives 40%,
// so a new page starts with a visible nudge to add more.
// `key` is a dictionary key in `completion.items` for the "add this next" list.
type Check = { key: string; weight: number; done: (p: Profile) => boolean };

const CHECKS: Check[] = [
  // Step 1 — always done once the page exists
  { key: "basics", weight: 40, done: (p) => !!(p.name && p.professionId && p.city && p.intro) },
  // Step 2
  { key: "photo", weight: 12, done: (p) => !!p.photo },
  { key: "about", weight: 10, done: (p) => p.about.trim().length >= 40 },
  { key: "services", weight: 10, done: (p) => p.services.length > 0 },
  { key: "portfolio", weight: 10, done: (p) => p.portfolio.length > 0 || p.videos.length > 0 },
  { key: "cover", weight: 4, done: (p) => !!p.cover },
  { key: "experience", weight: 4, done: (p) => p.yearsExperience != null },
  { key: "languages", weight: 4, done: (p) => p.languages.length > 0 },
  { key: "hours", weight: 3, done: (p) => !!p.workingHours.trim() },
  { key: "serviceArea", weight: 3, done: (p) => !!p.serviceArea.trim() },
  {
    key: "links",
    weight: 0, // shown as a suggestion but not weighted
    done: (p) => !!(p.contact.email || p.contact.website || p.contact.instagram),
  },
];

const TOTAL = CHECKS.reduce((s, c) => s + c.weight, 0);

export function profileCompletion(p: Profile): { percent: number; missing: string[] } {
  let earned = 0;
  const missing: string[] = [];
  for (const c of CHECKS) {
    if (c.done(p)) earned += c.weight;
    else missing.push(c.key);
  }
  return { percent: Math.round((earned / TOTAL) * 100), missing };
}
