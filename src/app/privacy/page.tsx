import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { getServerDict } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerDict();
  return { title: `${t.legal.privacyTitle} · Maya` };
}

export default function PrivacyPage() {
  return <LegalPage kind="privacy" />;
}
