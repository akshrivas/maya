// CLASSIC — calm and trustworthy. For CAs, lawyers, consultants and other professional services.
import { professionName } from "@/config/professions";
import type { PageCtx } from "@/components/page/helpers";
import { placeLine } from "@/components/page/helpers";
import { PinIcon } from "@/components/page/icons";
import {
  AboutSection, ActionButtons, Avatar, ContactSection, DetailsSection, MayaFooter, PageShareButton,
  ServicesSection, StickyContactBar, VerifiedBadge, VideosSection, WorkSection, type Theme,
} from "@/components/page/sections";

const theme: Theme = {
  section: "border-t border-[#e4e1d8] py-8",
  h2: "mb-4 font-serif text-xl text-[#1c2b4a]",
  muted: "text-[#6b6f7b]",
  chip: "",
  row: "border-b border-[#efece4] last:border-0",
  link: "text-[#1c2b4a]",
  callBtn: "bg-[#1c2b4a] text-white hover:bg-[#131f37]",
  waBtn: "bg-[#1fa855] text-white hover:bg-[#178a45]",
  shareBtn: "border border-[#d9d5ca] bg-white text-[#1c2b4a] hover:bg-[#f6f4ee]",
  avatar: "rounded-2xl border-4 border-white bg-[#c9a961] text-[#1c2b4a] shadow-md",
  footer: "text-[#1c2b4a]",
};

export function ClassicTemplate({ ctx }: { ctx: PageCtx }) {
  const { profile, lang } = ctx;
  return (
    <div className="min-h-dvh bg-[#faf8f3] font-sans text-[#22252d]">
      <header>
        <div className="h-28 bg-[#1c2b4a] sm:h-36">
          {profile.cover && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profile.cover.url} alt="" className="h-full w-full object-cover opacity-80" />
          )}
        </div>
        <div className="mx-auto max-w-2xl px-5">
          <div className="-mt-12 flex items-end gap-4">
            <Avatar ctx={ctx} theme={theme} size={104} />
          </div>
          <h1 className="mt-4 font-serif text-3xl leading-tight text-[#1c2b4a]">
            {profile.name} <VerifiedBadge ctx={ctx} />
          </h1>
          <p className="mt-1 text-sm font-semibold uppercase tracking-wider text-[#a8893f]">
            {professionName(profile.professionId, lang)}
          </p>
          <p className="mt-2 flex items-center gap-1 text-sm text-[#6b6f7b]">
            <PinIcon /> {placeLine(profile)}
          </p>
          <p className="mt-4 font-serif text-lg italic leading-snug text-[#3b4150]">“{profile.intro}”</p>
          <ActionButtons ctx={ctx} theme={theme} className="mt-6" />
          <PageShareButton ctx={ctx} theme={theme} className="mt-2 w-full" />
        </div>
      </header>

      <main className="mx-auto mt-8 max-w-2xl px-5">
        <AboutSection ctx={ctx} theme={theme} />
        <ServicesSection ctx={ctx} theme={theme} />
        <WorkSection ctx={ctx} theme={theme} />
        <VideosSection ctx={ctx} theme={theme} />
        <DetailsSection ctx={ctx} theme={theme} />
        <ContactSection ctx={ctx} theme={theme} />
      </main>
      <MayaFooter ctx={ctx} theme={theme} />
      <StickyContactBar ctx={ctx} theme={theme} bar="border-[#e4e1d8] bg-[#faf8f3]/95 backdrop-blur" />
    </div>
  );
}
