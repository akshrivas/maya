import Link from "next/link";
import { getServerDict } from "@/i18n/server";
import { Logo } from "@/components/Logo";

export default async function NotFound() {
  const { t } = await getServerDict();
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center px-6 text-center">
      <Logo />
      <h1 className="mt-8 font-serif text-3xl">{t.page.notFoundTitle}</h1>
      <p className="mt-2 text-muted">{t.page.notFoundBody}</p>
      <Link href="/" className="btn-primary mt-8">
        {t.page.notFoundCta}
      </Link>
    </main>
  );
}
