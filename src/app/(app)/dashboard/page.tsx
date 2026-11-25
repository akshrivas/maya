"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { useAuth } from "@/components/auth/AuthProvider";
import { firebase } from "@/lib/firebase/client";
import { publicPageUrl } from "@/lib/site";
import type { Profile } from "@/lib/profile/types";

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!user) return router.replace("/login");
    getDoc(doc(firebase().db, "profiles", user.uid)).then((s) =>
      s.exists() ? setProfile(s.data() as Profile) : router.replace("/onboarding"),
    );
  }, [user, loading, router]);

  if (!profile) return <p className="p-10 text-center">…</p>;
  return (
    <main className="mx-auto max-w-md p-6">
      <p>Your page is live:</p>
      <a data-testid="page-link" className="font-semibold underline" href={`/${profile.handle}`}>
        {publicPageUrl(profile.handle)}
      </a>
    </main>
  );
}
