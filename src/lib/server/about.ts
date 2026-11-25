import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase/admin";
import { professionCategory, professionName } from "@/config/professions";
import { spokenLanguageName } from "@/config/languages";
import type { Lang } from "@/i18n";

export const DAILY_AI_LIMIT = 10;

export type AboutInput = {
  name: string;
  professionId: string;
  city: string;
  area: string;
  intro: string;
  yearsExperience: number | null;
  services: string[];
  languages: string[];
  extra: Record<string, string>;
  lang: Lang;
};

const OUTPUT_LANGUAGE: Record<Lang, string> = { en: "English", hi: "Hindi (Devanagari script)" };

const SYSTEM = `You write the "About" section for a professional's public page on Maya, a site where Indian professionals (tutors, doctors, CAs, electricians, makeup artists and so on) get a free page that customers find through WhatsApp and Google.

Write in the first person, as the professional. Aim for 80-140 words in two or three short paragraphs separated by a blank line. Warm, clear and confident, in simple words a customer in a small Indian city would read easily. Say who they are, what they do, who they help and why someone should contact them, and end with a short friendly line inviting the reader to message or call.

Use only facts given in the details. Never invent qualifications, awards, years, client counts, prices or locations. If something isn't given, leave it out.

Output plain text only: no title, no markdown, no bullet points, no hashtags, no emojis, no quotation marks around the text.`;

/** Turns the one-line intro (plus any details already filled in) into a full About text. */
export async function writeAbout(input: AboutInput): Promise<string> {
  const client = new Anthropic(); // reads ANTHROPIC_API_KEY from the environment
  const category = professionCategory(input.professionId);
  const extras = category.extraFields
    .map((f) => (input.extra[f.key]?.trim() ? `${f.label.en}: ${input.extra[f.key].trim()}` : ""))
    .filter(Boolean);

  const details = [
    `Name: ${input.name}`,
    `Profession: ${professionName(input.professionId, "en")}`,
    `Location: ${[input.area, input.city].filter(Boolean).join(", ")}`,
    input.yearsExperience != null ? `Years of experience: ${input.yearsExperience}` : "",
    input.services.length ? `Services: ${input.services.join("; ")}` : "",
    input.languages.length ? `Languages spoken: ${input.languages.map(spokenLanguageName).join(", ")}` : "",
    ...extras,
  ]
    .filter(Boolean)
    .join("\n");

  const response = await client.beta.messages.create({
    model: "claude-opus-5-5",
    max_tokens: 16000,
    // Short writing task: low effort keeps it quick for someone waiting on their phone.
    output_config: { effort: "low" },
    // If the main model declines, the API retries on a suitable fallback model in the same call.
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    system: SYSTEM,
    messages: [
      {
        role: "user",
        content: `<details>\n${details}\n</details>\n\n<one_line_intro>\n${input.intro}\n</one_line_intro>\n\nWrite the About section in ${OUTPUT_LANGUAGE[input.lang]}.`,
      },
    ],
  });

  if (response.stop_reason === "refusal") throw new Error("refused");
  const text = response.content
    .map((b) => (b.type === "text" ? b.text : ""))
    .join("")
    .trim();
  if (!text) throw new Error("empty");
  return text.slice(0, 2000);
}

/** Counts AI uses per user per day (UTC). Returns false when the daily limit is reached. */
export async function takeAiQuota(uid: string): Promise<boolean> {
  const db = adminDb();
  const day = new Date().toISOString().slice(0, 10);
  const ref = db.collection("aiUsage").doc(`${uid}_${day}`);
  return db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const count = (snap.get("count") as number | undefined) ?? 0;
    if (count >= DAILY_AI_LIMIT) return false;
    tx.set(ref, { uid, day, count: FieldValue.increment(1) }, { merge: true });
    return true;
  });
}
