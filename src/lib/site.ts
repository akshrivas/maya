// Site-wide settings that come from environment variables.

/** Full public address of the site, e.g. https://maya.in (no trailing slash). */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(
  /\/$/,
  "",
);

/** Short form shown to users, e.g. "maya.in" */
export const SITE_HOST = SITE_URL.replace(/^https?:\/\//, "");

export function publicPageUrl(handle: string): string {
  return `${SITE_URL}/${handle}`;
}
