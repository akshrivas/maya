"use client";

import { fmt } from "@/i18n";
import { useT } from "@/i18n/client";
import { profileCompletion } from "@/lib/profile/completion";
import type { Profile } from "@/lib/profile/types";

/** Where each "add this next" suggestion takes you on the dashboard. */
const TARGET: Record<string, string> = {
  photo: "sec-photos",
  cover: "sec-photos",
  about: "sec-about",
  services: "sec-services",
  portfolio: "sec-work",
  experience: "sec-more",
  languages: "sec-more",
  hours: "sec-more",
  serviceArea: "sec-more",
  links: "sec-contact",
};

export function CompletionBar({ profile, onOpen }: { profile: Profile; onOpen: (sectionId: string) => void }) {
  const { t } = useT();
  const { percent, missing } = profileCompletion(profile);
  const items = t.completion.items as Record<string, string>;
  const next = missing.filter((k) => TARGET[k]).slice(0, 3);

  return (
    <section className="card" aria-label={t.completion.title}>
      <div className="flex items-baseline justify-between">
        <h2 className="font-semibold">{fmt(t.completion.percent, { percent })}</h2>
        {percent === 100 && <span className="text-sm">🎉</span>}
      </div>
      <div
        className="mt-3 h-3 overflow-hidden rounded-full bg-brand-50"
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div className="h-full rounded-full bg-gradient-to-r from-brand-500 to-accent-500 transition-all" style={{ width: `${percent}%` }} />
      </div>
      {next.length > 0 ? (
        <>
          <p className="mt-3 text-sm text-muted">{t.completion.nudge}</p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {next.map((k) => (
              <li key={k}>
                <button
                  type="button"
                  onClick={() => onOpen(TARGET[k])}
                  className="rounded-full border border-line bg-white px-3 py-1.5 text-sm font-medium hover:border-brand-500"
                >
                  + {items[k]}
                </button>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p className="mt-3 text-sm text-muted">{t.completion.done}</p>
      )}
    </section>
  );
}
