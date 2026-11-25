// FRIENDLY — warm, soft and approachable. For tutors, coaches, doctors and wellness.
import { professionName } from "@/config/professions";
import type { PageCtx } from "@/components/page/helpers";
import { placeLine } from "@/components/page/helpers";
import { PinIcon } from "@/components/page/icons";
import {
  AboutSection, ActionButtons, Avatar, ContactSection, DetailsSection, MayaFooter, PageShareButton,
  ServicesSection, StickyContactBar, VerifiedBadge, VideosSection, WorkSection, type Theme,
} from "@/components/page/sections";

const theme: Theme = {
  section: "rounded-3xl bg-white p-5 shadow-[0_1px_0_rgba(0,0,0,0.04),0_8px_24px_-12px_rgba(60,40,20,0.15)]",
  h2: "mb-3 text-lg font-bold text-[#2d5d62]",
  muted: "text-[#7a6f66]",
  chip: "rounded-full bg-[#fdebd9] px-3 py-1 text-sm text-[#8a4b1d]",
  row: "border-b border-dashed border-[#efe5da] last:border-0",
  link: "text-[#2d7d84]",
  callBtn: "bg-[#2d7d84] text-white hover:bg-[#256a70]",
  waBtn: "bg-[#1fa855] text-white hover:bg-[#178a45]",
  shareBtn: "bg-[#fdebd9] text-[#8a4b1d] hover:bg-[#fbdfc4]",
  avatar: "rounded-full border-[5px] border-white bg-[#ffcf9e] text-[#8a4b1d] shadow-lg",
  footer: "text-[#2d5d62]",
};

export function FriendlyTemplate({ ctx }: { ctx: PageCtx }) {
  const { profile, lang } = ctx;
  return (
    <div className="min-h-dvh bg-[#fff8f0] font-sans text-[#2f2a26]">
      <header className="relative">
        <div className="h-36 overflow-hidden rounded-b-[2.5rem] bg-gradient-to-br from-[#ffd6a8] via-[#ffc3a0] to-[#9fd8d5]">
          {profile.cover && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profile.cover.url} alt="" className="h-full w-full object-cover" />
          )}
        </div>
        <div className="mx-auto -mt-14 flex max-w-xl flex-col items-center px-5 text-center">
          <Avatar ctx={ctx} theme={theme} size={112} />
          <h1 className="mt-3 text-2xl font-extrabold leading-tight">
            {profile.name} <VerifiedBadge ctx={ctx} />
          </h1>
          <p className="mt-2 inline-flex flex-wrap justify-center gap-2">
            <span className={theme.chip}>{professionName(profile.professionId, lang)}</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-[#dff1ef] px-3 py-1 text-sm text-[#2d5d62]">
              <PinIcon size={14} /> {placeLine(profile)}
            </span>
          </p>
          <p className="mt-4 text-[1.05rem] leading-relaxed text-[#5a4f47]">{profile.intro}</p>
          <ActionButtons ctx={ctx} theme={theme} className="mt-5 w-full" />
          <PageShareButton ctx={ctx} theme={theme} className="mt-2 w-full" />
        </div>
      </header>

      <main className="mx-auto mt-8 grid max-w-xl gap-4 px-4">
        <AboutSection ctx={ctx} theme={theme} />
        <ServicesSection ctx={ctx} theme={theme} />
        <WorkSection ctx={ctx} theme={theme} />
        <VideosSection ctx={ctx} theme={theme} />
        <DetailsSection ctx={ctx} theme={theme} />
        <ContactSection ctx={ctx} theme={theme} />
      </main>
      <MayaFooter ctx={ctx} theme={theme} />
      <StickyContactBar ctx={ctx} theme={theme} bar="border-[#f1e3d3] bg-[#fff8f0]/95 backdrop-blur" />
    </div>
  );
}
