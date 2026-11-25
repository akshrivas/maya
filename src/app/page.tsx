import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { getServerDict } from "@/i18n/server";
import { fmt } from "@/i18n";
import { SITE_HOST } from "@/lib/site";

export default async function HomePage() {
  const { t } = await getServerDict();
  const points = [
    { icon: "⚡", title: t.home.point1Title, body: fmt(t.home.point1Body, { host: SITE_HOST }) },
    { icon: "📞", title: t.home.point2Title, body: t.home.point2Body },
    { icon: "✍️", title: t.home.point3Title, body: t.home.point3Body },
    { icon: "🔗", title: t.home.point4Title, body: t.home.point4Body },
  ];

  return (
    <>
      <SiteHeader />
      <main>
        <section className="mx-auto grid max-w-5xl gap-10 px-4 pb-14 pt-10 md:grid-cols-2 md:items-center md:pt-20">
          <div>
            <p className="mb-4 inline-block rounded-full bg-accent-400/25 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-ink">
              {t.home.badge}
            </p>
            <h1 className="font-serif text-4xl leading-tight tracking-tight md:text-5xl">
              {t.home.headline}
            </h1>
            <p className="mt-4 text-lg text-muted">{t.home.sub}</p>
            <Link href="/login" className="btn-primary mt-7 w-full text-lg sm:w-auto">
              {t.home.cta} →
            </Link>
          </div>

          {/* A little preview of what a Maya page looks like */}
          <div aria-hidden className="mx-auto w-full max-w-xs">
            <div className="overflow-hidden rounded-[2rem] border-8 border-ink bg-white shadow-xl">
              <div className="h-24 bg-gradient-to-br from-brand-500 to-brand-900" />
              <div className="-mt-10 px-5 pb-6 text-center">
                <div className="mx-auto grid h-20 w-20 place-items-center rounded-full border-4 border-white bg-accent-400 font-serif text-3xl text-ink">
                  P
                </div>
                <p className="mt-2 text-lg font-bold">{t.home.exampleName}</p>
                <p className="text-sm text-muted">{t.home.exampleRole}</p>
                <div className="mt-4 grid grid-cols-2 gap-2 text-sm font-semibold">
                  <span className="rounded-lg bg-whatsapp py-2 text-white">WhatsApp</span>
                  <span className="rounded-lg bg-ink py-2 text-white">Call</span>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="h-2 rounded bg-line" />
                  <div className="h-2 w-5/6 rounded bg-line" />
                  <div className="h-2 w-4/6 rounded bg-line" />
                </div>
                <p className="mt-4 text-xs text-muted">{SITE_HOST}/priya-sharma-indore</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-4 pb-16">
          <div className="grid gap-4 sm:grid-cols-2">
            {points.map((p) => (
              <div key={p.title} className="card">
                <p className="text-2xl">{p.icon}</p>
                <h2 className="mt-2 text-lg font-semibold">{p.title}</h2>
                <p className="mt-1 text-muted">{p.body}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link href="/login" className="btn-primary w-full text-lg sm:w-auto">
              {t.home.cta} →
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
