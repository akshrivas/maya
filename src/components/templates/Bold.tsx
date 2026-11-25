// BOLD — high contrast, big buttons, easy to read in sunlight. For electricians, plumbers, repairs.
import { professionName } from "@/config/professions";
import type { PageCtx } from "@/components/page/helpers";
import { placeLine } from "@/components/page/helpers";
import { PinIcon } from "@/components/page/icons";
import {
  AboutSection, ActionButtons, Avatar, ContactSection, DetailsSection, MayaFooter, PageShareButton,
  ServicesSection, StickyContactBar, VerifiedBadge, VideosSection, WorkSection, type Theme,
} from "@/components/page/sections";

const theme: Theme = {
  section: "border-[3px] border-black bg-white p-5 shadow-[6px_6px_0_#000]",
  h2: "mb-3 text-xl font-black uppercase tracking-tight",
  muted: "text-black/60",
  chip: "",
  row: "border-b-2 border-black/10 last:border-0",
  link: "text-black",
  callBtn: "border-[3px] border-black bg-black text-[#ffd400] text-lg",
  waBtn: "border-[3px] border-black bg-[#1fa855] text-white text-lg",
  shareBtn: "border-[3px] border-black bg-white text-black",
  avatar: "rounded-xl border-[3px] border-black bg-white text-black",
  footer: "text-black",
};

export function BoldTemplate({ ctx }: { ctx: PageCtx }) {
  const { profile, lang } = ctx;
  return (
    <div className="min-h-dvh bg-[#fff3b0] font-sans text-black">
      <header className="border-b-[3px] border-black bg-[#ffd400]">
        <div className="mx-auto max-w-2xl px-5 pb-6 pt-8">
          <div className="flex items-center gap-4">
            <Avatar ctx={ctx} theme={theme} size={76} />
            <div className="min-w-0">
              <p className="inline-block bg-black px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-[#ffd400]">
                {professionName(profile.professionId, lang)}
              </p>
              <p className="mt-1 flex items-center gap-1 text-sm font-semibold">
                <PinIcon /> {placeLine(profile)}
              </p>
            </div>
          </div>
          <h1 className="mt-4 text-4xl font-black uppercase leading-[0.95] tracking-tight sm:text-5xl">
            {profile.name} <VerifiedBadge ctx={ctx} />
          </h1>
          <p className="mt-3 text-lg font-semibold leading-snug">{profile.intro}</p>
          <ActionButtons ctx={ctx} theme={theme} className="mt-5" />
          <PageShareButton ctx={ctx} theme={theme} className="mt-2 w-full" />
        </div>
      </header>

      <main className="mx-auto mt-8 grid max-w-2xl gap-6 px-5">
        <ServicesSection ctx={ctx} theme={theme} />
        <AboutSection ctx={ctx} theme={theme} />
        <WorkSection ctx={ctx} theme={theme} />
        <VideosSection ctx={ctx} theme={theme} />
        <DetailsSection ctx={ctx} theme={theme} />
        <ContactSection ctx={ctx} theme={theme} />
      </main>
      <MayaFooter ctx={ctx} theme={theme} />
      <StickyContactBar ctx={ctx} theme={theme} bar="border-black bg-[#ffd400]" />
    </div>
  );
}
