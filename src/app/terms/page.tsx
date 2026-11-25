import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { getServerDict } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerDict();
  return { title: `${t.legal.termsTitle} · Maya` };
}

export default function TermsPage() {
  return <LegalPage kind="terms" />;
}
