import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";
import { getServerDict } from "@/i18n/server";
import { legalDocs } from "@/content/legal";

export async function LegalPage({ kind }: { kind: "privacy" | "terms" }) {
  const { lang, t } = await getServerDict();
  const doc = legalDocs[kind][lang];
  const title = kind === "privacy" ? t.legal.privacyTitle : t.legal.termsTitle;

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-2xl px-4 py-10">
        <h1 className="font-serif text-3xl">{title}</h1>
        <p className="mt-1 text-sm text-muted">
          {t.legal.lastUpdated}: {doc.updated}
        </p>
        <p className="mt-5 rounded-xl border border-accent-400 bg-accent-400/15 p-3 text-sm">
          ⚠️ {t.legal.placeholderNotice}
        </p>
        <div className="mt-8 space-y-7">
          {doc.sections.map((s) => (
            <section key={s.heading}>
              <h2 className="text-lg font-semibold">{s.heading}</h2>
              {s.body.map((p, i) => (
                <p key={i} className="mt-2 leading-relaxed text-ink/85">
                  {p}
                </p>
              ))}
            </section>
          ))}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
