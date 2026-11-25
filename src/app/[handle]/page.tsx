// The public page: maya.in/<handle>. Rendered on the server so Google and WhatsApp
// link previews can read it, and so it loads fast on phones.
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { getServerDict } from "@/i18n/server";
import { getPublishedProfile } from "@/lib/server/profiles";
import { publicPageUrl } from "@/lib/site";
import { professionName } from "@/config/professions";
import { ProfilePage } from "@/components/templates";
import { placeLine } from "@/components/page/helpers";

export const dynamic = "force-dynamic"; // always show the latest edits

const load = cache((handle: string) => getPublishedProfile(handle));

type Props = { params: Promise<{ handle: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params;
  const profile = await load(handle.toLowerCase());
  if (!profile) return { title: "Maya", robots: { index: false } };
  const { lang } = await getServerDict();
  const profession = professionName(profile.professionId, lang);
  const title = `${profile.name} — ${profession}, ${profile.city}`;
  const description = profile.intro;
  const url = publicPageUrl(profile.handle);
  const image = profile.photo?.url ?? profile.cover?.url ?? profile.portfolio[0]?.url;
  return {
    title: `${title} | Maya`,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "profile",
      title,
      description,
      url,
      siteName: "Maya",
      images: image ? [{ url: image, alt: profile.name }] : undefined,
    },
    twitter: { card: image ? "summary_large_image" : "summary", title, description, images: image ? [image] : undefined },
  };
}

export default async function PublicProfilePage({ params }: Props) {
  const { handle } = await params;
  const profile = await load(handle.toLowerCase());
  if (!profile) notFound();
  const { lang, t } = await getServerDict();
  const url = publicPageUrl(profile.handle);

  // Structured data so search engines understand the business (name, phone, location).
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: profile.name,
    description: profile.about || profile.intro,
    url,
    telephone: profile.contact.phone,
    image: profile.photo?.url,
    address: {
      "@type": "PostalAddress",
      streetAddress: profile.area || undefined,
      addressLocality: profile.city,
      addressRegion: profile.state,
      postalCode: profile.pincode || undefined,
      addressCountry: profile.country,
    },
    areaServed: profile.serviceArea || placeLine(profile),
    knowsLanguage: profile.languages.length ? profile.languages : undefined,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <ProfilePage ctx={{ profile, lang, t, url }} />
    </>
  );
}
