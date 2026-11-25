// Building blocks shared by all page templates. Each template passes a Theme (its colours
// and shapes) and arranges these sections in its own order and layout.
import Link from "next/link";
import { fmt } from "@/i18n";
import { professionCategory, professionName } from "@/config/professions";
import { spokenLanguageName } from "@/config/languages";
import { formatPhone } from "@/config/countries";
import { SITE_HOST } from "@/lib/site";
import {
  callHref,
  initials,
  placeLine,
  priceText,
  whatsappHref,
  websiteLabel,
  youtubeId,
  type PageCtx,
} from "./helpers";
import { PhoneIcon, VerifiedIcon, WhatsAppIcon } from "./icons";
import { ShareButton } from "./ShareButton";

export type Theme = {
  section: string;
  h2: string;
  muted: string;
  chip: string;
  row: string;
  link: string;
  callBtn: string;
  waBtn: string;
  shareBtn: string;
  avatar: string;
  footer: string;
};

const btnBase =
  "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-base font-semibold transition active:scale-[0.98]";

export function Avatar({ ctx, theme, size = 96 }: { ctx: PageCtx; theme: Theme; size?: number }) {
  const { profile } = ctx;
  const style = { width: size, height: size };
  if (profile.photo) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={profile.photo.url} alt={profile.name} style={style} className={`object-cover ${theme.avatar}`} />;
  }
  return (
    <div style={{ ...style, fontSize: size * 0.38 }} className={`grid place-items-center font-semibold ${theme.avatar}`} aria-hidden>
      {initials(profile.name)}
    </div>
  );
}

export function VerifiedBadge({ ctx }: { ctx: PageCtx }) {
  if (!ctx.profile.verified) return null;
  return (
    <span title={ctx.t.page.verified} className="inline-flex align-middle">
      <VerifiedIcon />
      <span className="sr-only">{ctx.t.page.verified}</span>
    </span>
  );
}

export function ActionButtons({ ctx, theme, className = "" }: { ctx: PageCtx; theme: Theme; className?: string }) {
  const { profile, t } = ctx;
  return (
    <div className={`grid grid-cols-2 gap-2 ${className}`}>
      <a href={whatsappHref(profile, t)} target="_blank" rel="noopener noreferrer" className={`${btnBase} ${theme.waBtn}`}>
        <WhatsAppIcon />
        {t.page.whatsapp}
      </a>
      <a href={callHref(profile)} className={`${btnBase} ${theme.callBtn}`}>
        <PhoneIcon />
        {t.page.call}
      </a>
    </div>
  );
}

export function PageShareButton({ ctx, theme, className = "" }: { ctx: PageCtx; theme: Theme; className?: string }) {
  const { profile, t, url, lang } = ctx;
  const text = fmt(t.page.shareText, {
    name: profile.name,
    profession: professionName(profile.professionId, lang),
    city: profile.city,
  });
  return (
    <ShareButton
      url={url}
      title={profile.name}
      text={text}
      fileName={`maya-${profile.handle}-qr`}
      className={`${btnBase} ${theme.shareBtn} ${className}`}
    />
  );
}

/** Sticky WhatsApp + Call bar at the bottom of the screen on phones. */
export function StickyContactBar({ ctx, theme, bar }: { ctx: PageCtx; theme: Theme; bar: string }) {
  return (
    <div className={`fixed inset-x-0 bottom-0 z-40 border-t px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 md:hidden ${bar}`}>
      <ActionButtons ctx={ctx} theme={theme} className="mx-auto max-w-md" />
    </div>
  );
}

export function Section({ title, theme, children, id }: { title: string; theme: Theme; children: React.ReactNode; id?: string }) {
  return (
    <section id={id} className={theme.section}>
      <h2 className={theme.h2}>{title}</h2>
      {children}
    </section>
  );
}

export function AboutSection({ ctx, theme }: { ctx: PageCtx; theme: Theme }) {
  // The one-line intro is already shown at the top, so only show this once there is a real "About".
  const text = ctx.profile.about.trim();
  if (!text) return null;
  return (
    <Section title={ctx.t.page.about} theme={theme} id="about">
      <div className="space-y-3 leading-relaxed">
        {text.split(/\n{2,}/).map((para, i) => (
          <p key={i} className="whitespace-pre-line">
            {para}
          </p>
        ))}
      </div>
    </Section>
  );
}

export function ServicesSection({ ctx, theme }: { ctx: PageCtx; theme: Theme }) {
  const { profile, t } = ctx;
  if (!profile.services.length) return null;
  return (
    <Section title={t.page.services} theme={theme} id="services">
      <ul>
        {profile.services.map((s, i) => (
          <li key={i} className={`flex items-baseline justify-between gap-4 py-3 ${theme.row}`}>
            <span className="font-medium">{s.name}</span>
            <span className={`shrink-0 text-right text-sm font-semibold ${theme.link}`}>{priceText(s, profile, t)}</span>
          </li>
        ))}
      </ul>
    </Section>
  );
}

export function PortfolioGrid({ ctx, className = "grid grid-cols-2 gap-2 sm:grid-cols-3", imgClass = "rounded-xl" }: { ctx: PageCtx; className?: string; imgClass?: string }) {
  return (
    <div className={className}>
      {ctx.profile.portfolio.map((img, i) => (
        <a key={img.path} href={img.url} target="_blank" rel="noopener noreferrer" className="block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={img.url}
            alt={`${ctx.profile.name} — ${ctx.t.page.work} ${i + 1}`}
            loading="lazy"
            className={`aspect-square w-full object-cover ${imgClass}`}
          />
        </a>
      ))}
    </div>
  );
}

export function WorkSection({ ctx, theme }: { ctx: PageCtx; theme: Theme }) {
  if (!ctx.profile.portfolio.length) return null;
  return (
    <Section title={ctx.t.page.work} theme={theme} id="work">
      <PortfolioGrid ctx={ctx} />
    </Section>
  );
}

export function VideosSection({ ctx, theme }: { ctx: PageCtx; theme: Theme }) {
  const { profile, t } = ctx;
  if (!profile.videos.length) return null;
  return (
    <Section title={t.page.videos} theme={theme} id="videos">
      <div className="grid gap-3 sm:grid-cols-2">
        {profile.videos.map((url) => {
          const yt = youtubeId(url);
          return (
            <a key={url} href={url} target="_blank" rel="noopener noreferrer" className="group relative block overflow-hidden rounded-xl bg-black">
              {yt ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={`https://i.ytimg.com/vi/${yt}/hqdefault.jpg`} alt="" loading="lazy" className="aspect-video w-full object-cover opacity-90 group-hover:opacity-100" />
              ) : (
                <div className="flex aspect-video items-center justify-center p-4 text-center text-sm text-white/80">{websiteLabel(url)}</div>
              )}
              <span className="absolute inset-0 grid place-items-center">
                <span className="grid h-12 w-12 place-items-center rounded-full bg-white/90 text-black shadow">▶</span>
              </span>
            </a>
          );
        })}
      </div>
    </Section>
  );
}

export function DetailsSection({ ctx, theme }: { ctx: PageCtx; theme: Theme }) {
  const { profile, t, lang } = ctx;
  const category = professionCategory(profile.professionId);
  const rows: [string, string][] = [];
  for (const f of category.extraFields) {
    const v = profile.extra[f.key]?.trim();
    if (v) rows.push([f.label[lang] || f.label.en, v]);
  }
  if (profile.yearsExperience != null) rows.push([t.page.experience, fmt(t.page.experienceYears, { n: profile.yearsExperience })]);
  if (profile.languages.length) rows.push([t.page.languages, profile.languages.map(spokenLanguageName).join(", ")]);
  if (profile.workingHours) rows.push([t.page.hours, profile.workingHours]);
  if (profile.serviceArea) rows.push([t.page.serviceArea, profile.serviceArea]);
  rows.push([t.page.location, [placeLine(profile), profile.state, profile.pincode].filter(Boolean).join(", ")]);

  return (
    <Section title={t.page.details} theme={theme} id="details">
      <dl>
        {rows.map(([k, v]) => (
          <div key={k} className={`grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-4 py-2.5 ${theme.row}`}>
            <dt className={theme.muted}>{k}</dt>
            <dd className="font-medium">{v}</dd>
          </div>
        ))}
      </dl>
    </Section>
  );
}

export function ContactSection({ ctx, theme }: { ctx: PageCtx; theme: Theme }) {
  const { profile, t } = ctx;
  const c = profile.contact;
  const items: { label: string; value: string; href: string }[] = [
    { label: t.page.call, value: formatPhone(c.phone), href: callHref(profile) },
  ];
  if (c.whatsapp && c.whatsapp !== c.phone) items.push({ label: t.page.whatsapp, value: formatPhone(c.whatsapp), href: whatsappHref(profile, t) });
  if (c.email) items.push({ label: t.page.email, value: c.email, href: `mailto:${c.email}` });
  if (c.website) items.push({ label: t.page.website, value: websiteLabel(c.website), href: c.website });
  if (c.instagram) items.push({ label: t.page.instagram, value: `@${c.instagram}`, href: `https://instagram.com/${c.instagram}` });
  return (
    <Section title={t.page.contact} theme={theme} id="contact">
      <ul>
        {items.map((i) => (
          <li key={i.label} className={`flex justify-between gap-4 py-2.5 ${theme.row}`}>
            <span className={theme.muted}>{i.label}</span>
            <a href={i.href} target={i.href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" className={`truncate font-medium ${theme.link}`}>
              {i.value}
            </a>
          </li>
        ))}
      </ul>
    </Section>
  );
}

/** "Get your free page on Maya" — on every page (FSD feature 10). */
export function MayaFooter({ ctx, theme }: { ctx: PageCtx; theme: Theme }) {
  return (
    <footer className={`px-4 pb-28 pt-10 text-center text-sm md:pb-10 ${theme.footer}`}>
      <Link href={`/?ref=${ctx.profile.handle}`} className="inline-flex items-center gap-2 rounded-full border border-current/20 px-4 py-2 font-semibold">
        <span aria-hidden className="grid h-5 w-5 place-items-center rounded-md bg-[#0f735f] font-serif text-xs text-white">
          m
        </span>
        {ctx.t.footer.getYourPage}
      </Link>
      <p className="mt-3 opacity-60">{SITE_HOST}</p>
    </footer>
  );
}
