import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { listPublishedHandles } from "@/lib/server/profiles";

export const dynamic = "force-dynamic";
export const revalidate = 3600;

/** /sitemap.xml — tells Google about every public page. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const fixed: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/privacy` },
    { url: `${SITE_URL}/terms` },
  ];
  try {
    const pages = await listPublishedHandles();
    return [
      ...fixed,
      ...pages.map((p) => ({ url: `${SITE_URL}/${p.handle}`, lastModified: new Date(p.updatedAt), priority: 0.8 })),
    ];
  } catch (err) {
    console.error("sitemap: could not list pages", err);
    return fixed;
  }
}
