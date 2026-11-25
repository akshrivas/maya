import Link from "next/link";
import { getServerDict } from "@/i18n/server";

export async function SiteFooter() {
  const { t } = await getServerDict();
  return (
    <footer className="border-t border-line/70 py-8 text-sm text-muted">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-3 px-4 sm:flex-row sm:justify-between">
        <p>© {new Date().getFullYear()} Maya</p>
        <nav className="flex gap-5">
          <Link href="/privacy" className="hover:text-ink">
            {t.nav.privacy}
          </Link>
          <Link href="/terms" className="hover:text-ink">
            {t.nav.terms}
          </Link>
        </nav>
      </div>
    </footer>
  );
}
