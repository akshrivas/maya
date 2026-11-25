// GALLERY — dark and elegant, puts work photos first. For makeup artists, photographers, designers.
import { professionName } from "@/config/professions";
import type { PageCtx } from "@/components/page/helpers";
import { placeLine } from "@/components/page/helpers";
import {
  AboutSection, ActionButtons, Avatar, ContactSection, DetailsSection, MayaFooter, PageShareButton,
  PortfolioGrid, Section, ServicesSection, StickyContactBar, VerifiedBadge, VideosSection, type Theme,
} from "@/components/page/sections";

const theme: Theme = {
  section: "border-t border-white/10 py-8",
  h2: "mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-[#e9a3b5]",
  muted: "text-white/55",
  chip: "",
  row: "border-b border-white/10 last:border-0",
  link: "text-[#f3c1cd]",
  callBtn: "bg-white text-[#141414] hover:bg-white/90",
  waBtn: "bg-[#1fa855] text-white hover:bg-[#178a45]",
  shareBtn: "border border-white/25 text-white hover:bg-white/10",
  avatar: "rounded-full border-2 border-[#e9a3b5] bg-[#2a2a2a] text-[#e9a3b5]",
  footer: "text-white/80",
};

export function GalleryTemplate({ ctx }: { ctx: PageCtx }) {
  const { profile, lang, t } = ctx;
  const hero = profile.cover?.url ?? profile.portfolio[0]?.url;
  return (
    <div className="min-h-dvh bg-[#121212] font-sans text-white">
      <header className="relative">
        <div className="relative h-[46vh] min-h-72 overflow-hidden bg-gradient-to-br from-[#3a2430] to-[#121212]">
          {hero && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={hero} alt="" className="h-full w-full object-cover" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-[#121212]/40 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 mx-auto max-w-2xl px-5 pb-2">
            <Avatar ctx={ctx} theme={theme} size={72} />
            <h1 className="mt-3 font-serif text-4xl leading-none">
              {profile.name} <VerifiedBadge ctx={ctx} />
            </h1>
            <p className="mt-2 text-sm uppercase tracking-[0.2em] text-[#e9a3b5]">
              {professionName(profile.professionId, lang)} · {placeLine(profile)}
            </p>
          </div>
        </div>
        <div className="mx-auto max-w-2xl px-5">
          <p className="mt-4 text-lg leading-snug text-white/85">{profile.intro}</p>
          <ActionButtons ctx={ctx} theme={theme} className="mt-5" />
          <PageShareButton ctx={ctx} theme={theme} className="mt-2 w-full" />
        </div>
      </header>

      <main className="mx-auto mt-8 max-w-2xl px-5">
        {profile.portfolio.length > 0 && (
          <Section title={t.page.work} theme={theme} id="work">
            <PortfolioGrid ctx={ctx} className="grid grid-cols-2 gap-1.5 sm:grid-cols-3" imgClass="rounded-md" />
          </Section>
        )}
        <VideosSection ctx={ctx} theme={theme} />
        <AboutSection ctx={ctx} theme={theme} />
        <ServicesSection ctx={ctx} theme={theme} />
        <DetailsSection ctx={ctx} theme={theme} />
        <ContactSection ctx={ctx} theme={theme} />
      </main>
      <MayaFooter ctx={ctx} theme={theme} />
      <StickyContactBar ctx={ctx} theme={theme} bar="border-white/10 bg-[#121212]/95 backdrop-blur" />
    </div>
  );
}
